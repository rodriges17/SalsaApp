import XCTest

final class NavigationTests: XCTestCase {
    func testOverviewEditorAndDiscard() {
        let app = XCUIApplication(); app.launchArguments = ["--ui-testing"]; app.launch()
        XCTAssertTrue(app.staticTexts["Salsa Figuren"].waitForExistence(timeout: 15))
        app.buttons["addFigure"].tap()
        let title = app.textFields["figureTitle"]
        XCTAssertTrue(title.waitForExistence(timeout: 10))
        XCTAssertFalse(app.buttons["saveFigure"].isEnabled)
        title.tap(); title.typeText("Sombrero")
        // A name alone cannot be saved without a confirmed video.
        XCTAssertFalse(app.buttons["saveFigure"].isEnabled)
        app.buttons["Zurück"].tap()
        XCTAssertTrue(app.buttons["Weiter bearbeiten"].waitForExistence(timeout: 5))
        app.buttons["Weiter bearbeiten"].tap()
        XCTAssertEqual(title.value as? String, "Sombrero")
        app.buttons["Zurück"].tap(); app.buttons["Änderungen verwerfen"].tap()
        XCTAssertTrue(app.staticTexts["Salsa Figuren"].waitForExistence(timeout: 5))
        let screenshot = XCTAttachment(screenshot: app.screenshot()); screenshot.lifetime = .keepAlways; add(screenshot)
    }
}
