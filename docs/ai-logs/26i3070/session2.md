Conversation Log
Okay so now lets get onto making the next page


Hey, now let's build my third and final page, pages/loyalty.html, using pure semantic HTML5, custom CSS3, and vanilla JavaScript only—no Bootstrap or external JS libraries.

Important File Naming Rule:
Keep the HTML file named pages/loyalty.html, but every other new CSS or JS file you create for this page must include _i263070 in its filename (for example: css/loyalty_i263070.css and js/loyalty_i263070.js) so my files stay completely distinct and never cause merge conflicts with other group members. Reuse our existing shared stylesheets (../css/style.css, ../css/components.css, ../css/responsive.css) and shared navigation/header/footer setup (data-root="../").

1. Structure of pages/loyalty.html:

Premium Dark Hero (.page-hero.premium): Radial dark espresso-to-gold gradient hero with eyebrow "The Coffee Circle Rewards", heading "Every Sip Brings You Closer to Something Special.", and subtitle "Earn 10 points for every PKR 100 you spend and redeem them for free coffee."

Main Container: <section class="section"><div class="container"><div id="loyalty-root"></div></div></section> rendered dynamically by js/loyalty_i263070.js.

2. Loyalty Points Logic & Dashboard in js/loyalty_i263070.js:

Points Calculation: Customers earn 10 points for every PKR 100 spent (Math.floor(amount / 100) * 10, whole hundreds only; free reward drinks cost PKR 0 and earn 0 points).

Top Balance & Progress Card (.balance-card):

If logged in (reading the current user session and user points/history from localStorage): greet the user by first name, show their live points balance in large gold Playfair Display numbers, state how many free rewards they can currently afford, and render a caramel-to-gold progress bar (.progress / .progress-fill) showing how many points remain until their next reward tier.

If logged out: show a call-to-action card with Log in (auth.html?next=loyalty.html) and Join free (auth.html?mode=register&next=loyalty.html) buttons.

4-Card Rewards Catalogue (.reward-grid):

100 points: Free Classic Espresso (Single shot of our signature espresso, on us.)

180 points: Free Classic Cappuccino (A small Classic Cappuccino with velvety foam.)

250 points: Free Classic Latte (A small Classic Latte, smooth and milky.)

350 points: Free Signature Coffee (Our Circle Special Mocha, the house favourite.)

Redemption & Refund Flow:

Clicking Redeem reward checks login and balance; if insufficient, shows an error toast with the exact missing points.

If eligible, deducts the points in localStorage, appends a redeemed entry to the user's history and redeemed arrays, adds that drink to the localStorage cart at PKR 0 as a free reward, updates the navbar cart badge, and shows a success toast. Also export/provide a helper so removing a free reward from the cart refunds its points automatically.

Explainer & History Tables: Include a beige .how-it-works box explaining the PKR 100 = 10 points rule with a PKR 500 example, followed by a .two-col section displaying a Points History table (Date, Activity, Details, +/- Points) and a Redeemed Rewards list from localStorage.

I have built your third and final page: pages/loyalty.html along with its custom stylesheet css/loyalty_i263070.css and script js/loyalty_i263070.js using semantic HTML5, custom CSS3, and vanilla JavaScript only.

What Was Built:

Structure (pages/loyalty.html):

Reuses shared styles (style_i263070.css, components_i263070.css, responsive_i263070.css) and shared navigation/footer mounting (navigation_i263070.js) with data-root="../".
Premium Dark Hero (.page-hero.premium): Features a dark espresso-to-gold radial gradient, eyebrow "The Coffee Circle Rewards", heading "Every Sip Brings You Closer to Something Special.", and subtitle "Earn 10 points for every PKR 100 you spend and redeem them for free coffee.".
Dynamic Root: <section class="section"><div class="container"><div id="loyalty-root"></div></div></section>.

Styling (css/loyalty_i263070.css):

Radial espresso glow hero styling with crisp typography.
Gold Playfair Display balance numerals, caramel-to-gold progress bar with smooth transitions, and responsive cards.
Clean 4-card reward grid with hover micro-elevations, SVG drink illustrations, and status badges.
Warm beige .how-it-works formula container, .two-col history table, and claimed rewards layout.

Loyalty Logic & Dashboard (js/loyalty_i263070.js):

Points Calculation: Math.floor(amount / 100) * 10 (exported helper calculateEarnedPoints).
Top Balance & Progress Card (.balance-card):
Logged In: Greets user by first name, displays live points balance, states how many free rewards can currently be afforded, and renders a caramel-to-gold progress bar showing points remaining until their next tier.
Logged Out: Displays a call-to-action card with Log in (auth.html?next=loyalty.html) and Join free (auth.html?mode=register&next=loyalty.html).
4-Card Rewards Catalogue (.reward-grid):
100 pts: Free Classic Espresso
180 pts: Free Classic Cappuccino
250 pts: Free Classic Latte
350 pts: Free Signature Coffee
Redemption & Refund Flow:
Validates authentication and balance; shows toast with exact missing points if insufficient.
On successful redemption: deducts points, logs to user history and redeemed list in localStorage, adds drink to cart at PKR 0, increments the navbar cart badge, and displays a success toast.
Global helper window.refundCartReward(cartItemKey) is available to automatically refund points when a reward item is removed from the cart.
Explainer & History:
Beige .how-it-works box demonstrating the PKR 100 = 10 points rule with a PKR 500 example.
.two-col section rendering the points history table and redeemed rewards list.
Okay so now lets get onto making the next page


Hey, now let's build my third and final page, pages/loyalty.html, using pure semantic HTML5, custom CSS3, and vanilla JavaScript only—no Bootstrap or external JS libraries.

Important File Naming Rule:
Keep the HTML file named pages/loyalty.html, but every other new CSS or JS file you create for this page must include _i263070 in its filename (for example: css/loyalty_i263070.css and js/loyalty_i263070.js) so my files stay completely distinct and never cause merge conflicts with other group members. Reuse our existing shared stylesheets (../css/style.css, ../css/components.css, ../css/responsive.css) and shared navigation/header/footer setup (data-root="../").

1. Structure of pages/loyalty.html:

Premium Dark Hero (.page-hero.premium): Radial dark espresso-to-gold gradient hero with eyebrow "The Coffee Circle Rewards", heading "Every Sip Brings You Closer to Something Special.", and subtitle "Earn 10 points for every PKR 100 you spend and redeem them for free coffee."

Main Container: <section class="section"><div class="container"><div id="loyalty-root"></div></div></section> rendered dynamically by js/loyalty_i263070.js.

2. Loyalty Points Logic & Dashboard in js/loyalty_i263070.js:

Points Calculation: Customers earn 10 points for every PKR 100 spent (Math.floor(amount / 100) * 10, whole hundreds only; free reward drinks cost PKR 0 and earn 0 points).

Top Balance & Progress Card (.balance-card):

If logged in (reading the current user session and user points/history from localStorage): greet the user by first name, show their live points balance in large gold Playfair Display numbers, state how many free rewards they can currently afford, and render a caramel-to-gold progress bar (.progress / .progress-fill) showing how many points remain until their next reward tier.

If logged out: show a call-to-action card with Log in (auth.html?next=loyalty.html) and Join free (auth.html?mode=register&next=loyalty.html) buttons.

4-Card Rewards Catalogue (.reward-grid):

100 points: Free Classic Espresso (Single shot of our signature espresso, on us.)

180 points: Free Classic Cappuccino (A small Classic Cappuccino with velvety foam.)

250 points: Free Classic Latte (A small Classic Latte, smooth and milky.)

350 points: Free Signature Coffee (Our Circle Special Mocha, the house favourite.)

Redemption & Refund Flow:

Clicking Redeem reward checks login and balance; if insufficient, shows an error toast with the exact missing points.

If eligible, deducts the points in localStorage, appends a redeemed entry to the user's history and redeemed arrays, adds that drink to the localStorage cart at PKR 0 as a free reward, updates the navbar cart badge, and shows a success toast. Also export/provide a helper so removing a free reward from the cart refunds its points automatically.

Explainer & History Tables: Include a beige .how-it-works box explaining the PKR 100 = 10 points rule with a PKR 500 example, followed by a .two-col section displaying a Points History table (Date, Activity, Details, +/- Points) and a Redeemed Rewards list from localStorage.

Your third and final page, pages/loyalty.html, along with its dedicated stylesheet css/loyalty_i263070.css and vanilla JavaScript logic js/loyalty_i263070.js, has been created.

Implementation Summary:

HTML Structure (pages/loyalty.html):

Reuses the shared stylesheets (../css/style_i263070.css, ../css/components_i263070.css, ../css/responsive_i263070.css) and shared navigation/footer script (../js/navigation_i263070.js) with data-root="../".
Premium Dark Hero (.page-hero.premium): Features an espresso radial glow with eyebrow "The Coffee Circle Rewards", heading "Every Sip Brings You Closer to Something Special.", and subtitle "Earn 10 points for every PKR 100 you spend and redeem them for free coffee.".
Dynamic Root: <section class="section"><div class="container"><div id="loyalty-root"></div></div></section>.

Custom CSS (css/loyalty_i263070.css):

Premium dark radial hero with glowing ambient layer.
Large gold Playfair Display numerals for live points balance.
Smooth caramel-to-gold progress bar (.progress / .progress-fill).
Clean 4-card reward grid with hover micro-elevation, SVG coffee cup artwork, and status badges.
Warm beige .how-it-works calculation card and .two-col history table / redeemed rewards list.

Vanilla JS Loyalty Engine (js/loyalty_i263070.js):

Points Formula: Math.floor(amount / 100) * 10 (exported as window.calculateEarnedPoints).
Top Balance & Progress Card (.balance-card):
Logged In: Greets user by first name, displays live balance in gold Playfair Display font, indicates how many free drinks they can currently afford, and renders progress toward their next tier.
Logged Out: Shows a call-to-action card with Log in (auth.html?next=loyalty.html) and Join free (auth.html?mode=register&next=loyalty.html).
4-Card Rewards Catalogue (.reward-grid):
100 pts: Free Classic Espresso
180 pts: Free Classic Cappuccino
250 pts: Free Classic Latte
350 pts: Free Signature Coffee
Redemption & Refund Flow:
Validates balance; shows error toast with exact missing points if insufficient.
On successful redemption: deducts points, records history and redeemed items in localStorage, adds drink to cart at PKR 0, updates the navbar cart badge, and shows a success toast.
Exports window.refundCartReward(cartItemKey) to automatically refund points when removing a free reward drink from the cart.
Explainer & History:
Beige .how-it-works box explaining the PKR 100 = 10 points rule with a PKR 500 example.
Two-column section rendering the Points History table (Date, Activity, Details, +/- Points) and Redeemed Rewards list from localStorage.