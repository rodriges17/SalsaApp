"""Install explicitly supplied Apple signing material on an ephemeral macOS runner.

Never generates credentials, prints secret values, or falls back to unsigned output.
"""
import base64
import datetime
import os
from pathlib import Path
import plistlib
import re
import secrets
import subprocess
import sys
import uuid

APP_ID = 'com.rodriges17.SalsaTrainer'
GROUP = 'group.com.rodriges17.SalsaTrainer'


def validate_profile(profile, bundle_id, team):
    entitlements = profile.get('Entitlements', {})
    if profile.get('TeamIdentifier') != [team]:
        raise ValueError('Provisioning profile belongs to a different Apple team.')
    prefix = profile.get('ApplicationIdentifierPrefix', [])
    if not prefix or entitlements.get('application-identifier') != prefix[0] + '.' + bundle_id:
        raise ValueError('Provisioning profile does not match the exact bundle ID.')
    if GROUP not in entitlements.get('com.apple.security.application-groups', []):
        raise ValueError('Provisioning profile does not enable the shared App Group.')
    expiry = profile.get('ExpirationDate')
    if not isinstance(expiry, datetime.datetime) or expiry.replace(tzinfo=datetime.timezone.utc) <= datetime.datetime.now(datetime.timezone.utc):
        raise ValueError('Provisioning profile has expired.')
    if entitlements.get('get-task-allow') or profile.get('ProvisionedDevices') or profile.get('ProvisionsAllDevices'):
        raise ValueError('An App Store distribution profile is required.')
    return str(uuid.UUID(profile['UUID']))


def run(*args):
    return subprocess.check_output(args, stderr=subprocess.DEVNULL)


def main():
    required = ['IOS_TEAM_ID', 'IOS_DISTRIBUTION_P12_BASE64', 'IOS_DISTRIBUTION_P12_PASSWORD',
                'IOS_APP_PROFILE_BASE64', 'IOS_SHARE_PROFILE_BASE64']
    missing = [key for key in required if not os.environ.get(key)]
    if missing:
        raise ValueError('Missing signing configuration: ' + ', '.join(missing))
    team = os.environ['IOS_TEAM_ID']
    if not re.fullmatch(r'[A-Z0-9]{10}', team):
        raise ValueError('Invalid Apple team ID.')
    private = Path(os.environ['RUNNER_TEMP']) / 'ios-signing'
    private.mkdir(mode=0o700, exist_ok=False)
    keychain = private / 'distribution.keychain-db'
    # Persist cleanup information before any credentials are installed.
    with open(os.environ['GITHUB_ENV'], 'a') as env:
        env.write(f'IOS_SIGNING_DIR={private}\nIOS_KEYCHAIN_PATH={keychain}\n')
    def decode(name, filename):
        path = private / filename
        path.write_bytes(base64.b64decode(''.join(os.environ[name].split()), validate=True))
        path.chmod(0o600)
        return path
    p12 = decode('IOS_DISTRIBUTION_P12_BASE64', 'distribution.p12')
    profiles = {}
    for kind, bundle in [('APP', APP_ID), ('SHARE', APP_ID + '.Share')]:
        path = decode(f'IOS_{kind}_PROFILE_BASE64', kind.lower() + '.mobileprovision')
        profile = plistlib.loads(run('security', 'cms', '-D', '-i', str(path)))
        identifier = validate_profile(profile, bundle, team)
        profiles[kind] = (identifier, path)
    password = secrets.token_urlsafe(32)
    run('security', 'create-keychain', '-p', password, str(keychain))
    run('security', 'set-keychain-settings', '-lut', '21600', str(keychain))
    run('security', 'unlock-keychain', '-p', password, str(keychain))
    run('security', 'import', str(p12), '-P', os.environ['IOS_DISTRIBUTION_P12_PASSWORD'],
        '-T', '/usr/bin/codesign', '-T', '/usr/bin/security', '-t', 'cert', '-f', 'pkcs12', '-k', str(keychain))
    run('security', 'set-key-partition-list', '-S', 'apple-tool:,apple:,codesign:', '-k', password, str(keychain))
    run('security', 'list-keychains', '-d', 'user', '-s', str(keychain))
    if not re.search(rb'"Apple Distribution:', run('security', 'find-identity', '-v', '-p', 'codesigning', str(keychain))):
        raise ValueError('No valid Apple Distribution identity in certificate file.')
    # Modern Xcode and older Xcode look in different profile directories.
    for directory in [Path.home() / 'Library/MobileDevice/Provisioning Profiles',
                      Path.home() / 'Library/Developer/Xcode/UserData/Provisioning Profiles']:
        directory.mkdir(parents=True, exist_ok=True)
        for identifier, path in profiles.values():
            target = directory / (identifier + '.mobileprovision')
            target.write_bytes(path.read_bytes())
            target.chmod(0o600)
            with (private / 'installed-profiles.txt').open('a') as cleanup:
                cleanup.write(str(target) + '\n')
    with open(os.environ['GITHUB_ENV'], 'a') as env:
        for kind, (identifier, _) in profiles.items():
            env.write(f'{kind}_PROFILE_UUID={identifier}\n')
    options = {'method': 'app-store-connect', 'destination': 'export', 'signingStyle': 'manual',
               'teamID': team, 'signingCertificate': 'Apple Distribution',
               'manageAppVersionAndBuildNumber': False,
               'provisioningProfiles': {APP_ID: profiles['APP'][0], APP_ID + '.Share': profiles['SHARE'][0]}}
    (private / 'ExportOptions.plist').write_bytes(plistlib.dumps(options))
    print('Distribution identity and both App Group profiles prepared.')


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        # subprocess errors may include arguments containing passwords: do not print them.
        print(str(error) if isinstance(error, ValueError) else 'Signing preparation failed. Check signing files and password.', file=sys.stderr)
        sys.exit(1)
