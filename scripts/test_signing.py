import datetime
import importlib.util
from pathlib import Path
import unittest
import uuid

spec = importlib.util.spec_from_file_location('signing', Path(__file__).with_name('prepare-signing.py'))
signing = importlib.util.module_from_spec(spec)
spec.loader.exec_module(signing)


class ProfileValidationTests(unittest.TestCase):
    def profile(self):
        return {'UUID': str(uuid.uuid4()), 'TeamIdentifier': ['123456ABCD'],
                'ApplicationIdentifierPrefix': ['123456ABCD'],
                'ExpirationDate': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=10),
                'Entitlements': {'application-identifier': '123456ABCD.' + signing.APP_ID,
                                 'com.apple.security.application-groups': [signing.GROUP],
                                 'get-task-allow': False}}

    def test_exact_app_and_share_profiles(self):
        for suffix in ['', '.Share']:
            with self.subTest(suffix=suffix):
                profile = self.profile()
                profile['Entitlements']['application-identifier'] += suffix
                self.assertEqual(signing.validate_profile(profile, signing.APP_ID + suffix, '123456ABCD'), profile['UUID'])

    def test_rejects_wrong_team_bundle_group_expiry_and_development_profiles(self):
        changes = [lambda p: p.update(TeamIdentifier=['OTHERTEAM0']),
                   lambda p: p['Entitlements'].update({'application-identifier': '123456ABCD.*'}),
                   lambda p: p['Entitlements'].update({'com.apple.security.application-groups': []}),
                   lambda p: p.update(ExpirationDate=datetime.datetime(2000, 1, 1)),
                   lambda p: p['Entitlements'].update({'get-task-allow': True}),
                   lambda p: p.update(ProvisionedDevices=['test-device']),
                   lambda p: p.update(ProvisionsAllDevices=True)]
        for change in changes:
            profile = self.profile()
            change(profile)
            with self.subTest(profile=profile), self.assertRaises(ValueError):
                signing.validate_profile(profile, signing.APP_ID, '123456ABCD')


if __name__ == '__main__':
    unittest.main()
