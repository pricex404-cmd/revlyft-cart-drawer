# Cart Appearance Tool - Comprehensive Test Plan

**Application:** Cart Upsell / Cart Appearance Configurator  
**Test Date:** January 7, 2026  
**Tester:** _________________  
**Version:** _________________

---

## 🎯 Testing Objectives

1. **Break the app** - Find edge cases and limits
2. **Validate all features** work independently and together
3. **Ensure preview matches storefront** rendering
4. **Test data persistence** and configuration saving
5. **Validate UI/UX** under extreme conditions

---

## 📋 Test Execution Notes

- ✅ = Pass
- ❌ = Fail
- ⚠️ = Partial/Warning
- 🔄 = Needs Retest
- N/A = Not Applicable

---

# SECTION 1: DESIGN & GENERAL SETTINGS

## 1.1 Font Settings

| Test ID | Test Case | Steps | Expected Result | Actual Result | Status |
|---------|-----------|-------|-----------------|---------------|--------|
| D-F-001 | Default font inheritance | 1. Enable "Inherit font from theme"<br>2. Save config<br>3. Check preview | Font should match theme font | | |
| D-F-002 | Custom font selection | 1. Disable "Inherit font from theme"<br>2. Select each font from dropdown<br>3. Verify preview updates | Each font should render correctly in preview | | |
| D-F-003 | Font persistence | 1. Set custom font (e.g., Georgia)<br>2. Save<br>3. Reload page | Custom font should persist after reload | | |
| D-F-004 | Toggle font inheritance | 1. Set custom font<br>2. Toggle "Inherit" ON/OFF multiple times<br>3. Save each time | Should switch between theme font and custom font | | |
| D-F-005 | Font with special characters | 1. Check if fonts render emojis/special chars in cart | Special characters should render properly | | |

### Attack Scenarios - Font Settings
| Test ID | Attack Scenario | Expected Behavior | Status |
|---------|----------------|-------------------|--------|
| D-F-ATK-001 | Rapidly toggle font inheritance 20+ times | App should not crash, final state should persist | |
| D-F-ATK-002 | Enable inheritance with non-existent theme font | Should fall back to system default font | |

---

## 1.2 Price Display Settings

| Test ID | Test Case | Steps | Expected Result | Actual Result | Status |
|---------|-----------|-------|-----------------|---------------|--------|
| D-P-001 | Show strikethrough prices - enabled | 1. Enable "Show strikethrough prices"<br>2. Add product WITH compare-at price<br>3. Check preview | Should show strikethrough price + current price | | |
| D-P-002 | Show strikethrough prices - disabled | 1. Disable "Show strikethrough prices"<br>2. Add product WITH compare-at price<br>3. Check preview | Should show only current price | | |
| D-P-003 | Product without compare-at price | 1. Enable strikethrough<br>2. Add product WITHOUT compare-at price | Should show only current price (no strikethrough) | | |
| D-P-004 | Multiple products mixed | 1. Add products with/without compare-at prices<br>2. Enable strikethrough | Strikethrough should only show where applicable | | |
| D-P-005 | Price formatting consistency | 1. Check prices with different currencies<br>2. Verify decimal places | Prices should format correctly per currency | | |

### Attack Scenarios - Price Display
| Test ID | Attack Scenario | Expected Behavior | Status |
|---------|----------------|-------------------|--------|
| D-P-ATK-001 | Product with compare-at price = current price | Should not show strikethrough (0% discount) | |
| D-P-ATK-002 | Product with compare-at < current price | Should handle invalid pricing gracefully | |
| D-P-ATK-003 | Extreme price values (e.g., $999,999,999.99) | Should display without overflow or breaking layout | |

---

## 1.3 Subtotal Line Settings

| Test ID | Test Case | Steps | Expected Result | Actual Result | Status |
|---------|-----------|-------|-----------------|---------------|--------|
| D-S-001 | Enable subtotal line | 1. Enable "Enable subtotal line"<br>2. Add products to cart<br>3. Check footer | Subtotal should appear in footer | | |
| D-S-002 | Disable subtotal line | 1. Disable "Enable subtotal line"<br>2. Check footer | Subtotal should not appear | | |
| D-S-003 | Subtotal calculation accuracy | 1. Add multiple products<br>2. Check calculated subtotal | Should equal sum of all product prices | | |
| D-S-004 | Empty cart subtotal | 1. Enable subtotal<br>2. Remove all products | Should show $0.00 or hide gracefully | | |
| D-S-005 | Subtotal with quantity changes | 1. Change product quantities<br>2. Verify subtotal updates | Subtotal should recalculate (Note: Preview is static) | | |

### Attack Scenarios - Subtotal
| Test ID | Attack Scenario | Expected Behavior | Status |
|---------|----------------|-------------------|--------|
| D-S-ATK-001 | Add 100+ products to cart | Subtotal should calculate correctly without overflow | |
| D-S-ATK-002 | Products with decimal precision issues | Should handle rounding correctly (e.g., 3×$0.33) | |

---

## 1.4 Checkout Button Styling

| Test ID | Test Case | Steps | Expected Result | Actual Result | Status |
|---------|-----------|-------|-----------------|---------------|--------|
| D-B-001 | Corner radius at minimum (0px) | 1. Set slider to 0px<br>2. Check button preview | Button should be square (no rounding) | | |
| D-B-002 | Corner radius at maximum (50px) | 1. Set slider to 50px<br>2. Check button preview | Button should be fully rounded (pill shape) | | |
| D-B-003 | Corner radius mid-values | 1. Test 8px, 16px, 24px, 32px<br>2. Verify smooth transitions | Each value should render distinctly | | |
| D-B-004 | Button color - light colors | 1. Set button to white (#FFFFFF)<br>2. Check visibility of text | Text should remain readable (contrast) | | |
| D-B-005 | Button color - dark colors | 1. Set button to black (#000000)<br>2. Check text color contrast | White text should be visible | | |
| D-B-006 | Button text color | 1. Change text color independently<br>2. Test multiple combinations | Text should update without affecting button bg | | |
| D-B-007 | Hover state - button color | 1. Set hover color different from normal<br>2. Hover over button in preview | Button should change color on hover | | |
| D-B-008 | Hover state - text color | 1. Set hover text color different from normal<br>2. Hover over button | Text should change color on hover | | |
| D-B-009 | Button persistence | 1. Set all button properties<br>2. Save and reload | All button styles should persist | | |
| D-B-010 | Button width | 1. Test on different screen sizes (if applicable)<br>2. Verify full width | Button should span full cart width | | |

### Attack Scenarios - Button Styling
| Test ID | Attack Scenario | Expected Behavior | Status |
|---------|----------------|-------------------|--------|
| D-B-ATK-001 | Same color for button bg and text | Should create unreadable button but not crash | |
| D-B-ATK-002 | Same colors for normal and hover states | Button should appear static on hover | |
| D-B-ATK-003 | Transparent colors (rgba with 0 alpha) | Should handle transparency gracefully | |
| D-B-ATK-004 | Invalid hex colors (e.g., #GGG) | Should reject or fall back to default | |
| D-B-ATK-005 | Rapidly adjust corner radius slider | Should update smoothly without lag | |

---

# SECTION 2: HEADER CONFIGURATION

## 2.1 Header Height & Borders

| Test ID | Test Case | Steps | Expected Result | Actual Result | Status |
|---------|-----------|-------|-----------------|---------------|--------|
| H-H-001 | Default header height (60px) | 1. Set to default 60px<br>2. Check header height in preview | Header should be 60px tall | | |
| H-H-002 | Minimum header height | 1. Test smallest allowable value<br>2. Check if content fits | Content should not overflow | | |
| H-H-003 | Maximum header height | 1. Test largest allowable value<br>2. Check if it looks reasonable | Should not take up excessive space | | |
| H-H-004 | Border - None | 1. Set border to "none"<br>2. Check preview | No border should appear below header | | |
| H-H-005 | Border - Thin | 1. Set border to "thin"<br>2. Check preview | Thin 1px border should appear | | |
| H-H-006 | Border - Medium | 1. Set border to "medium" (if available)<br>2. Check preview | Medium ~2px border should appear | | |
| H-H-007 | Border - Thick | 1. Set border to "thick" (if available)<br>2. Check preview | Thick ~3px border should appear | | |
| H-H-008 | Header background color | 1. Change header background color<br>2. Test light and dark colors | Background should update correctly | | |

### Attack Scenarios - Header Height & Borders
| Test ID | Attack Scenario | Expected Behavior | Status |
|---------|----------------|-------------------|--------|
| H-H-ATK-001 | Header height = 1px | Should still render without breaking layout | |
| H-H-ATK-002 | Header height = 500px | Should render but may look absurd (no crash) | |
| H-H-ATK-003 | Transparent header background | Should show underlying content or default bg | |

---

## 2.2 Header Title Configuration

| Test ID | Test Case | Steps | Expected Result | Actual Result | Status |
|---------|-----------|-------|-----------------|---------------|--------|
| H-T-001 | Default title text | 1. Use default "Your Cart ({{cart_quantity}} items)"<br>2. Check preview | Should display with dynamic placeholder | | |
| H-T-002 | Custom title text | 1. Change to custom text (e.g., "My Shopping Bag")<br>2. Save and check preview | Custom text should display | | |
| H-T-003 | Empty title text | 1. Delete all title text<br>2. Save | Should handle empty title gracefully | | |
| H-T-004 | Very long title (100+ chars) | 1. Enter long title<br>2. Check for text overflow/wrapping | Should wrap or truncate gracefully | | |
| H-T-005 | Title with special characters | 1. Add emojis, symbols (🛒, ♥, etc.)<br>2. Check rendering | Special chars should render correctly | | |
| H-T-006 | Title with HTML tags | 1. Try entering `<b>Bold</b>` or `<script>`<br>2. Verify sanitization | HTML should be escaped/sanitized | | |
| H-T-007 | Title alignment - Left | 1. Set alignment to "left"<br>2. Check preview | Title should align left | | |
| H-T-008 | Title alignment - Center | 1. Set alignment to "center"<br>2. Check preview | Title should center | | |
| H-T-009 | Title alignment - Right | 1. Set alignment to "right"<br>2. Check preview | Title should align right | | |
| H-T-010 | Title font weight - 100-900 | 1. Test different weight values<br>2. Check visibility | Weights should render visibly different | | |
| H-T-011 | Title font size - minimum | 1. Set to smallest size (e.g., 10px)<br>2. Check readability | Should be small but readable | | |
| H-T-012 | Title font size - maximum | 1. Set to largest size (e.g., 48px)<br>2. Check if it overflows | Should scale appropriately or truncate | | |
| H-T-013 | Dynamic variable {{cart_quantity}} | 1. Use title with {{cart_quantity}}<br>2. Check if it displays properly | Should show placeholder in preview | | |

### Attack Scenarios - Header Title
| Test ID | Attack Scenario | Expected Behavior | Status |
|---------|----------------|-------------------|--------|
| H-T-ATK-001 | 500+ character title | Should not break layout; may truncate | |
| H-T-ATK-002 | Title with line breaks (\n) | Should handle or strip line breaks | |
| H-T-ATK-003 | Title with only spaces | Should trim or show empty gracefully | |
| H-T-ATK-004 | XSS attempt: `<script>alert('xss')</script>` | Should sanitize and not execute script | |
| H-T-ATK-005 | SQL injection attempt in title | Should treat as string, no DB interaction | |
| H-T-ATK-006 | Font size = 0px | Should handle edge case without disappearing | |
| H-T-ATK-007 | Font size = 1000px | Should constrain or handle overflow | |
| H-T-ATK-008 | Font weight = 0 or 1000 | Should fall back to valid weights | |

---

# SECTION 3: ANNOUNCEMENT BAR

## 3.1 Basic Announcement Bar Settings

| Test ID | Test Case | Steps | Expected Result | Actual Result | Status |
|---------|-----------|-------|-----------------|---------------|--------|
| A-B-001 | Enable announcement bar | 1. Toggle announcement bar ON<br>2. Check preview | Bar should appear in cart preview | | |
| A-B-002 | Disable announcement bar | 1. Toggle announcement bar OFF<br>2. Check preview | Bar should disappear | | |
| A-B-003 | Position - Before products | 1. Set position to "before"<br>2. Check preview | Bar should appear above product list | | |
| A-B-004 | Position - After products | 1. Set position to "after"<br>2. Check preview | Bar should appear below products, above footer | | |
| A-B-005 | Background color | 1. Change background to various colors<br>2. Verify preview updates | Background should change immediately | | |
| A-B-006 | Text color | 1. Change text color<br>2. Ensure contrast with background | Text should be readable | | |
| A-B-007 | Border color | 1. Change border color<br>2. Check if border is visible | Border should match set color | | |
| A-B-008 | Height - minimum (30px) | 1. Set height slider to 30px<br>2. Check if text fits | Text should fit without overflow | | |
| A-B-009 | Height - maximum (100px) | 1. Set height slider to 100px<br>2. Check appearance | Bar should be tall but not break layout | | |
| A-B-010 | Height - mid values | 1. Test 40px, 50px, 60px, 70px<br>2. Check smooth scaling | Each height should render correctly | | |
| A-B-011 | Font size - minimum (10px) | 1. Set font size to 10px<br>2. Check readability | Text should be small but visible | | |
| A-B-012 | Font size - maximum (24px) | 1. Set font size to 24px<br>2. Check if it overflows bar | Text should scale or wrap appropriately | | |

### Attack Scenarios - Basic Announcement Bar
| Test ID | Attack Scenario | Expected Behavior | Status |
|---------|----------------|-------------------|--------|
| A-B-ATK-001 | Text color = background color | Creates invisible text but shouldn't crash | |
| A-B-ATK-002 | Height = 10px with font size = 24px | Should handle overflow gracefully | |
| A-B-ATK-003 | Toggle position rapidly 50+ times | Should update without lag or crash | |
| A-B-ATK-004 | Transparent background + transparent text | Should render (invisibly) without error | |

---

## 3.2 Single Banner Text

| Test ID | Test Case | Steps | Expected Result | Actual Result | Status |
|---------|-----------|-------|-----------------|---------------|--------|
| A-S-001 | Default announcement text | 1. Use default text<br>2. Check preview | Default message should display | | |
| A-S-002 | Custom announcement text | 1. Enter custom message<br>2. Save and preview | Custom message should display | | |
| A-S-003 | Empty announcement text | 1. Delete all text<br>2. Check behavior | Should show empty bar or placeholder | | |
| A-S-004 | Very long text (200+ chars) | 1. Enter long message<br>2. Check for wrapping/scrolling | Text should wrap or truncate | | |
| A-S-005 | Text with emojis | 1. Add emojis to text<br>2. Verify rendering | Emojis should display correctly | | |
| A-S-006 | Text with special characters | 1. Add &, <, >, ", ' symbols<br>2. Check encoding | Should escape/encode properly | | |
| A-S-007 | Bold formatting <b> | 1. Select text, click Bold button<br>2. Check `<b>` tags added | Text should render bold in preview | | |
| A-S-008 | Italic formatting <i> | 1. Select text, click Italic button<br>2. Check `<i>` tags added | Text should render italic in preview | | |
| A-S-009 | Underline formatting <u> | 1. Select text, click Underline button<br>2. Check `<u>` tags added | Text should render underlined in preview | | |
| A-S-010 | Multiple formatting tags | 1. Apply bold + italic + underline<br>2. Verify nested tags work | All formatting should apply | | |
| A-S-011 | Formatting without selection | 1. Click B/I/U without selecting text<br>2. Verify nothing happens | Should do nothing or show error | | |
| A-S-012 | Formatting button interaction | 1. Click formatting buttons in sequence<br>2. Check cursor position maintained | Should maintain proper cursor position | | |

### Attack Scenarios - Single Banner Text
| Test ID | Attack Scenario | Expected Behavior | Status |
|---------|----------------|-------------------|--------|
| A-S-ATK-001 | 1000+ character text | Should accept but may truncate display | |
| A-S-ATK-002 | Nested formatting `<b><i><u>text</u></i></b>` | Should handle nested HTML tags | |
| A-S-ATK-003 | Malformed HTML tags `<b>text<i>` | Should close tags or sanitize | |
| A-S-ATK-004 | XSS attempt: `<script>alert('xss')</script>` | Should escape/sanitize, not execute | |
| A-S-ATK-005 | Text with only spaces/newlines | Should trim or handle gracefully | |
| A-S-ATK-006 | Unicode/RTL text (Arabic/Hebrew) | Should render correctly | |
| A-S-ATK-007 | Rapid format/unformat cycles | Should not create malformed HTML | |

---

## 3.3 Dynamic Banner Rotation

| Test ID | Test Case | Steps | Expected Result | Actual Result | Status |
|---------|-----------|-------|-----------------|---------------|--------|
| A-D-001 | Enable dynamic banner | 1. Toggle "Dynamic banner" ON<br>2. Verify banner section appears | Banner list should become visible | | |
| A-D-002 | Disable dynamic banner | 1. Toggle "Dynamic banner" OFF<br>2. Verify single text input shows | Should revert to single banner mode | | |
| A-D-003 | Default banners (2 banners) | 1. Enable dynamic<br>2. Check initial banner count | Should show 2 default banners | | |
| A-D-004 | Banner rotation preview | 1. Enable dynamic with 2+ banners<br>2. Wait for auto-rotation<br>3. Observe animation | Should rotate through banners smoothly | | |
| A-D-005 | Auto-change time - 1 second | 1. Set auto-change to 1s<br>2. Observe rotation speed | Should rotate every 1 second | | |
| A-D-006 | Auto-change time - 10 seconds | 1. Set auto-change to 10s<br>2. Verify slower rotation | Should rotate every 10 seconds | | |
| A-D-007 | Auto-change time - variations | 1. Test 2s, 3s, 5s, 7s<br>2. Verify timing accuracy | Each timing should be distinct | | |

### Attack Scenarios - Dynamic Banner Rotation
| Test ID | Attack Scenario | Expected Behavior | Status |
|---------|----------------|-------------------|--------|
| A-D-ATK-001 | Set auto-change to 0 seconds | Should handle edge case (no rotation or instant) | |
| A-D-ATK-002 | Toggle dynamic ON/OFF rapidly | Should not cause memory leaks or crashes | |
| A-D-ATK-003 | Change timing during active rotation | Should adjust interval without breaking | |

---

## 3.4 Banner Management (Dynamic Mode)

| Test ID | Test Case | Steps | Expected Result | Actual Result | Status |
|---------|-----------|-------|-----------------|---------------|--------|
| A-M-001 | Add banner (count: 2→3) | 1. Click "Add Banner"<br>2. Verify new banner appears | 3rd banner should be added to list | | |
| A-M-002 | Add banner (count: 3→4) | 1. Click "Add Banner"<br>2. Verify new banner appears | 4th banner should be added | | |
| A-M-003 | Add banner (count: 4→5) | 1. Click "Add Banner"<br>2. Verify new banner appears | 5th banner should be added | | |
| A-M-004 | Add banner at limit (5) | 1. With 5 banners, click "Add Banner"<br>2. Check button state | Button should be disabled | | |
| A-M-005 | Banner counter display | 1. Check counter shows "X/5"<br>2. Add/remove banners and verify count updates | Counter should always reflect current count | | |
| A-M-006 | Remove banner (count > 2) | 1. With 3+ banners, click "Remove" on any<br>2. Verify banner deleted | Selected banner should be removed | | |
| A-M-007 | Remove button visibility | 1. Check with exactly 2 banners<br>2. Verify "Remove" button hidden | Remove should not be visible at minimum | | |
| A-M-008 | Banner ID uniqueness | 1. Add multiple banners<br>2. Check each has unique ID | IDs should be sequential and unique | | |
| A-M-009 | Edit banner text (1st banner) | 1. Change text in banner 1<br>2. Save and reload | Changes should persist | | |
| A-M-010 | Edit banner text (last banner) | 1. Change text in last banner<br>2. Verify independence from others | Should not affect other banners | | |
| A-M-011 | Add max banners, remove one, add again | 1. Add to 5 banners<br>2. Remove one<br>3. Add new banner | Should allow adding after removal | | |

### Attack Scenarios - Banner Management
| Test ID | Attack Scenario | Expected Behavior | Status |
|---------|----------------|-------------------|--------|
| A-M-ATK-001 | Rapidly click "Add Banner" 20+ times | Should stop at 5 and not create more | |
| A-M-ATK-002 | Remove all banners except last 2 simultaneously | Should maintain minimum of 2 banners | |
| A-M-ATK-003 | Add banner while rotation is active | Should add without disrupting rotation | |
| A-M-ATK-004 | Delete currently displayed banner | Should skip to next banner gracefully | |
| A-M-ATK-005 | Duplicate banner IDs (if manually edited) | Should handle duplicates without crash | |

---

## 3.5 Individual Banner Editing (Dynamic Mode)

| Test ID | Test Case | Steps | Expected Result | Actual Result | Status |
|---------|-----------|-------|-----------------|---------------|--------|
| A-E-001 | Edit Banner 1 text | 1. Enter text in Banner 1 input<br>2. Check preview rotation | Banner 1 should display new text | | |
| A-E-002 | Edit Banner 2 text | 1. Enter text in Banner 2 input<br>2. Check preview rotation | Banner 2 should display new text | | |
| A-E-003 | Edit all banners with unique text | 1. Give each banner distinct text<br>2. Watch rotation | Each should display its unique text | | |
| A-E-004 | Empty text in one banner | 1. Leave one banner's text empty<br>2. Check rotation | Should show empty slot or skip it | | |
| A-E-005 | Empty text in all banners | 1. Clear all banner texts<br>2. Check behavior | Should show empty bars during rotation | | |
| A-E-006 | Very long text in single banner | 1. Enter 200+ chars in one banner<br>2. Check overflow handling | Should wrap or truncate that banner | | |
| A-E-007 | Mixed length texts | 1. Short text in Banner 1, long in Banner 2<br>2. Watch rotation | Should handle varying lengths smoothly | | |
| A-E-008 | Bold formatting in Banner 1 | 1. Select text, click B button<br>2. Verify `<b>` tags added | Bold should work independently per banner | | |
| A-E-009 | Italic formatting in Banner 2 | 1. Select text, click I button<br>2. Verify `<i>` tags added | Italic should work independently | | |
| A-E-010 | Mixed formatting across banners | 1. Bold in Banner 1, Italic in Banner 2, etc.<br>2. Check each during rotation | Each banner should maintain its own formatting | | |
| A-E-011 | Banner text with emojis | 1. Add emojis to individual banners<br>2. Check rendering | Emojis should display correctly per banner | | |
| A-E-012 | Copy-paste between banners | 1. Copy text from Banner 1<br>2. Paste into Banner 2 | Should paste correctly (including formatting) | | |

### Attack Scenarios - Individual Banner Editing
| Test ID | Attack Scenario | Expected Behavior | Status |
|---------|----------------|-------------------|--------|
| A-E-ATK-001 | XSS in individual banner: `<img src=x onerror=alert(1)>` | Should sanitize and not execute | |
| A-E-ATK-002 | Nested tags across multiple banners | Should handle independently without conflict | |
| A-E-ATK-003 | Special chars: `& < > " '` in all banners | Should encode properly in each | |
| A-E-ATK-004 | Edit banner text during its display in rotation | Should update smoothly without breaking rotation | |
| A-E-ATK-005 | 1000+ chars in one banner, 10 chars in others | Should not affect other banners | |

---

## 3.6 Integration Testing - Announcement Bar

| Test ID | Test Case | Steps | Expected Result | Actual Result | Status |
|---------|-----------|-------|-----------------|---------------|--------|
| A-I-001 | Announcement + Header combination | 1. Enable announcement bar<br>2. Customize header<br>3. Verify both render correctly | Both should coexist without conflict | | |
| A-I-002 | Announcement before + after simultaneously | 1. This is not possible (radio buttons)<br>2. Verify only one position active | Only one position should be selectable | | |
| A-I-003 | Announcement + Empty cart | 1. Enable announcement<br>2. Remove all products<br>3. Check if bar still shows | Bar should display regardless of cart contents | | |
| A-I-004 | Announcement + Subtotal enabled | 1. Enable both announcement and subtotal<br>2. Check layout | Both should render without overlap | | |
| A-I-005 | Dynamic banner + Save/Reload | 1. Configure 5 banners with different texts<br>2. Save config<br>3. Reload page | All 5 banners should persist correctly | | |
| A-I-006 | Single→Dynamic→Single mode transition | 1. Start with single banner text<br>2. Switch to dynamic (should have defaults)<br>3. Switch back to single | Should transition smoothly without data loss | | |

### Attack Scenarios - Integration
| Test ID | Attack Scenario | Expected Behavior | Status |
|---------|----------------|-------------------|--------|
| A-I-ATK-001 | Enable announcement with height > cart height | Should not break cart layout | |
| A-I-ATK-002 | Announcement with very long text + small height | Should handle overflow (clip/scroll/wrap) | |
| A-I-ATK-003 | Rapidly switch single/dynamic modes 20+ times | Should not cause state corruption | |

---

# SECTION 4: CROSS-FEATURE TESTING

## 4.1 Multiple Features Enabled

| Test ID | Test Case | Steps | Expected Result | Actual Result | Status |
|---------|-----------|-------|-----------------|---------------|--------|
| C-M-001 | All features enabled at once | 1. Enable: Custom font, strikethrough, subtotal, custom button, custom header, announcement (dynamic, 5 banners)<br>2. Check preview | All should render without conflicts | | |
| C-M-002 | Minimal config (all disabled) | 1. Disable all optional features<br>2. Set to defaults<br>3. Check cart is usable | Basic cart should still function | | |
| C-M-003 | Conflicting colors test | 1. Set all colors to same value<br>2. Check usability | Should render but may be unusable (expected) | | |
| C-M-004 | Extreme values across all settings | 1. Set all sliders to max/min<br>2. Test all edges | Should handle extremes without crash | | |

---

## 4.2 Data Persistence & Save/Load

| Test ID | Test Case | Steps | Expected Result | Actual Result | Status |
|---------|-----------|-------|-----------------|---------------|--------|
| D-P-001 | Save complete config | 1. Configure all sections<br>2. Click "Save Configuration"<br>3. Wait for success message | Should save without error | | |
| D-P-002 | Load config after save | 1. Save config<br>2. Reload page<br>3. Verify all settings match | All settings should persist exactly | | |
| D-P-003 | Save with no changes | 1. Load existing config<br>2. Save immediately without edits | Should save successfully (idempotent) | | |
| D-P-004 | Rapid save clicks | 1. Click "Save" 10+ times quickly<br>2. Check for duplicate saves/errors | Should handle gracefully, no duplicates | | |
| D-P-005 | Save during banner rotation | 1. Enable dynamic banners<br>2. Save while rotation active | Should save without interrupting rotation | | |
| D-P-006 | Partial config save | 1. Configure only one section<br>2. Save<br>3. Reload and check | Should save partial config without resetting others | | |
| D-P-007 | Save failure handling | 1. Simulate network error (if possible)<br>2. Attempt save<br>3. Check error message | Should show error message, not lose data | | |

### Attack Scenarios - Persistence
| Test ID | Attack Scenario | Expected Behavior | Status |
|---------|----------------|-------------------|--------|
| D-P-ATK-001 | Save with 500KB+ config data | Should handle large configs or show size limit | |
| D-P-ATK-002 | Load corrupted/incomplete config from Firebase | Should fall back to defaults or show error | |
| D-P-ATK-003 | Save while another user saves (race condition) | Last write should win (or show conflict) | |

---

## 4.3 Preview vs Storefront Validation

| Test ID | Test Case | Steps | Expected Result | Actual Result | Status |
|---------|-----------|-------|-----------------|---------------|--------|
| P-S-001 | Basic appearance matching | 1. Configure basic settings<br>2. Compare preview to live storefront | Should match exactly | | |
| P-S-002 | Color rendering | 1. Set custom colors<br>2. Compare preview vs live | Colors should match across both | | |
| P-S-003 | Font rendering | 1. Set custom font<br>2. Compare preview vs live | Fonts should render identically | | |
| P-S-004 | Banner rotation timing | 1. Set 3s rotation<br>2. Time rotation in preview and live | Timing should be consistent | | |
| P-S-005 | Dynamic content ({{cart_quantity}}) | 1. Use dynamic variable in title<br>2. Check preview shows placeholder, live shows actual | Preview: placeholder, Live: real value | | |
| P-S-006 | Responsive behavior | 1. Test on mobile/tablet/desktop<br>2. Compare preview rendering | Should be responsive on live (preview is static) | | |
| P-S-007 | Button hover states | 1. Configure hover colors<br>2. Test on live storefront | Hover should work on live (preview works too) | | |

### Known Differences
| Feature | Preview Behavior | Live Behavior | Notes |
|---------|------------------|---------------|-------|
| {{cart_quantity}} | Shows placeholder text | Shows actual cart count | Expected difference |
| Product quantities | Static display | Interactive +/- buttons | Preview is demonstration only |
| Checkout button | Preview only | Functional on live | Preview is visual only |
| Dynamic calculations | Static subtotal | Real-time calculations | Live cart has full logic |

---

## 4.4 Browser & Performance Testing

| Test ID | Test Case | Steps | Expected Result | Actual Result | Status |
|---------|-----------|-------|-----------------|---------------|--------|
| B-P-001 | Chrome browser | 1. Test all features in Chrome<br>2. Check for browser-specific issues | Should work flawlessly | | |
| B-P-002 | Firefox browser | 1. Test all features in Firefox<br>2. Check rendering differences | Should work flawlessly | | |
| B-P-003 | Safari browser | 1. Test all features in Safari<br>2. Check webkit issues | Should work flawlessly | | |
| B-P-004 | Edge browser | 1. Test all features in Edge<br>2. Check for issues | Should work flawlessly | | |
| B-P-005 | Mobile Safari (iOS) | 1. Test on iPhone/iPad<br>2. Check touch interactions | Should be touch-friendly | | |
| B-P-006 | Mobile Chrome (Android) | 1. Test on Android device<br>2. Check responsiveness | Should work smoothly | | |
| B-P-007 | Page load performance | 1. Measure time to load config panel<br>2. Check for lag | Should load in <2 seconds | | |
| B-P-008 | Preview update performance | 1. Change settings rapidly<br>2. Check preview responsiveness | Preview should update smoothly | | |
| B-P-009 | Banner rotation performance | 1. Run rotation for 5+ minutes<br>2. Check for memory leaks | Should not slow down over time | | |

---

## 4.5 Edge Cases & Boundary Testing

| Test ID | Test Case | Steps | Expected Result | Actual Result | Status |
|---------|-----------|-------|-----------------|---------------|--------|
| E-C-001 | Zero products in cart | 1. Remove all products from preview<br>2. Check cart appearance | Should show empty state gracefully | | |
| E-C-002 | 100+ products in cart | 1. Add many products (if possible)<br>2. Check scrolling and performance | Should scroll smoothly | | |
| E-C-003 | Product with very long title | 1. Add product with 100+ char title<br>2. Check text wrapping | Should wrap or truncate title | | |
| E-C-004 | Product with no image | 1. Add product without image<br>2. Check placeholder display | Should show placeholder image | | |
| E-C-005 | Product with broken image URL | 1. Add product with invalid image URL<br>2. Check fallback | Should show placeholder/fallback | | |
| E-C-006 | Multiple currency codes | 1. Test with USD, EUR, GBP, JPY, etc.<br>2. Verify formatting | Each currency should format correctly | | |
| E-C-007 | Currency with no symbol (e.g., JPY) | 1. Test with JPY or similar<br>2. Check formatting | Should format without decimal if applicable | | |
| E-C-008 | Decimal precision edge cases | 1. Test prices like $9.999<br>2. Check rounding | Should round to 2 decimals | | |

---

# SECTION 5: SECURITY & VALIDATION TESTING

## 5.1 Input Validation

| Test ID | Test Case | Steps | Expected Result | Actual Result | Status |
|---------|-----------|-------|-----------------|---------------|--------|
| S-V-001 | SQL injection in text fields | 1. Enter SQL commands in text inputs<br>2. Save config | Should treat as plain text, no execution | | |
| S-V-002 | XSS in announcement text | 1. Enter `<script>alert('xss')</script>`<br>2. Check preview and saved data | Should sanitize/escape, not execute | | |
| S-V-003 | HTML injection in title | 1. Enter `<iframe>` or other tags<br>2. Verify sanitization | Should escape HTML tags | | |
| S-V-004 | CSS injection | 1. Enter `</style><style>body{display:none}</style>`<br>2. Check if it affects page | Should be escaped, not applied | | |
| S-V-005 | Invalid hex color codes | 1. Enter #GGGGGG or invalid hex<br>2. Check validation | Should reject or fall back to default | | |
| S-V-006 | Negative numbers in sliders | 1. Attempt negative values via dev tools<br>2. Check handling | Should constrain to min value | | |
| S-V-007 | Extremely large numbers | 1. Enter 999999px in height field<br>2. Check constraint | Should cap at reasonable max | | |

---

## 5.2 Firebase Integration

| Test ID | Test Case | Steps | Expected Result | Actual Result | Status |
|---------|-----------|-------|-----------------|---------------|--------|
| F-I-001 | Firebase connection | 1. Verify connection to Firebase<br>2. Check data save path | Should connect successfully | | |
| F-I-002 | Data structure validation | 1. Save config<br>2. Check Firebase for proper structure | Data should match expected schema | | |
| F-I-003 | Metadata inclusion | 1. Save config<br>2. Check metadata fields (lastUpdated, isActive, testId) | Metadata should be present | | |
| F-I-004 | Shop domain sanitization | 1. Save with shop domain containing dots<br>2. Check Firebase key format | Should replace dots with underscores | | |
| F-I-005 | Currency code persistence | 1. Save config<br>2. Verify currency saved with config | Currency should be included | | |

---

# TEST SUMMARY REPORT

## Overall Statistics

- **Total Test Cases:** _____ 
- **Passed:** _____ 
- **Failed:** _____ 
- **Blocked:** _____ 
- **Not Executed:** _____

## Critical Issues Found

| Issue ID | Severity | Description | Steps to Reproduce | Status |
|----------|----------|-------------|-------------------|--------|
| | | | | |

## Medium Priority Issues

| Issue ID | Severity | Description | Steps to Reproduce | Status |
|----------|----------|-------------|-------------------|--------|
| | | | | |

## Low Priority Issues / Enhancements

| Issue ID | Severity | Description | Steps to Reproduce | Status |
|----------|----------|-------------|-------------------|--------|
| | | | | |

---

## Notes & Observations

### Positive Findings
- 

### Areas of Concern
- 

### Recommendations
- 

---

## Sign-off

**Tester Name:** _____________________  
**Date:** _____________________  
**Signature:** _____________________

**Reviewed By:** _____________________  
**Date:** _____________________  
**Signature:** _____________________
