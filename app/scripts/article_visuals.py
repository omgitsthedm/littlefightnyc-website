"""Article visuals: a topic for every article, its clay object, and section-heading icons.

Every answer, guide and journal article opens with a topic chip, its own handmade clay
object and a reading line (time, cited sources, last update). Section headings carry a
small icon so long answers are easier to scan. The share card uses the same object, so
the page, its preview and its structured data show one consistent image.
"""
from html import escape
import re

# Topic chip label and its icon (assets/mineral).
TOPICS = {
    'Google & Maps': 'map-pin-duotone.svg',
    'Local search': 'map-trifold-duotone.svg',
    'AI search': 'sparkle-duotone.svg',
    'Accessibility': 'layout-duotone.svg',
    'Websites': 'browser-duotone.svg',
    'Website emergency': 'lifebuoy-duotone.svg',
    'Software costs': 'receipt-duotone.svg',
    'Custom software': 'puzzle-piece-duotone.svg',
    'Payments': 'credit-card-duotone.svg',
    'Booking': 'calendar-check-duotone.svg',
    'Bookkeeping': 'bank-duotone.svg',
    'Online store': 'shopping-bag-duotone.svg',
    'Business tools': 'app-window-duotone.svg',
    'Business email': 'envelope-simple-duotone.svg',
    'Tech support': 'wrench-duotone.svg',
    'Security': 'shield-check-duotone.svg',
    'Accounts & access': 'key-duotone.svg',
    'Domains': 'globe-hemisphere-west-duotone.svg',
    'Phones': 'phone-duotone.svg',
    'Wi-Fi & internet': 'wifi-high-duotone.svg',
    'Devices': 'laptop-duotone.svg',
    'Files & backups': 'hard-drives-duotone.svg',
    'Office moves': 'buildings-duotone.svg',
    'Printers': 'printer-duotone.svg',
    'Consulting': 'handshake-duotone.svg',
    'Getting help': 'chat-circle-dots-duotone.svg',
    'Video calls': 'video-camera-duotone.svg',
    'Speed': 'sparkle-duotone.svg',
}

# Article route -> (topic, clay object). Objects come from the prepared clay library.
ARTICLES = {
    '/answers/business-not-showing-on-google-maps/': ('Google & Maps', 'object-map-red-pin'),
    '/answers/google-business-profile-tips/': ('Google & Maps', 'object-priority-notes'),
    '/answers/google-business-profile-suspended/': ('Google & Maps', 'object-approval-stamp'),
    '/journal/how-to-answer-google-reviews-nyc-business/': ('Google & Maps', 'object-mail'),
    '/answers/is-local-seo-worth-it/': ('Local search', 'object-yellow-taxi-v1'),
    '/journal/what-google-looks-for-business-website/': ('Local search', 'object-map-red-pin'),
    '/journal/how-to-get-your-business-into-chatgpt-answers/': ('AI search', 'symbol-browser'),
    '/journal/questions-nyc-owners-actually-ask-us-about-ai/': ('AI search', 'object-rubber-duck'),
    '/journal/ada-website-lawsuits-nyc-small-business/': ('Accessibility', 'object-desk-workstation'),
    '/answers/does-my-small-business-need-a-website/': ('Websites', 'object-storefront'),
    '/answers/how-to-choose-a-web-designer-nyc/': ('Websites', 'object-redesign-paint'),
    '/answers/squarespace-vs-hiring-a-web-designer/': ('Websites', 'object-homepage-sketchbook'),
    '/answers/website-design-for-small-business-nyc/': ('Websites', 'object-homepage-sketchbook'),
    '/answers/wix-vs-custom-website/': ('Websites', 'object-construction-plans'),
    '/answers/wordpress-vs-custom-website-small-business/': ('Websites', 'object-construction-plans'),
    '/journal/wordpress-vs-webflow-vs-custom-nyc/': ('Websites', 'object-construction-plans'),
    '/answers/instagram-instead-of-a-website-nyc-shop/': ('Websites', 'object-content-camera'),
    '/answers/website-form-not-working-small-business/': ('Websites', 'object-mail'),
    '/answers/website-developer-disappeared/': ('Accounts & access', 'object-ownership-keys'),
    '/journal/how-to-own-your-domain-name-not-your-web-guy/': ('Domains', 'object-ownership-keys'),
    '/answers/website-down-emergency-nyc/': ('Website emergency', 'object-phone-chromatic'),
    '/journal/migrate-off-squarespace-without-breaking-booking/': ('Booking', 'object-booking-calendar'),
    '/answers/reduce-monthly-software-costs-small-business/': ('Software costs', 'object-scissors-red-tape'),
    '/answers/when-custom-business-system-beats-saas/': ('Custom software', 'object-repeat-work-machine'),
    '/journal/airtable-vs-notion-vs-monday-small-business/': ('Business tools', 'object-shared-file-cabinet'),
    '/journal/quickbooks-vs-wave-small-business-nyc/': ('Bookkeeping', 'object-notebook'),
    '/journal/why-small-business-tech-should-be-boring/': ('Tech support', 'object-software-maintenance'),
    '/journal/what-a-free-tech-audit-actually-looks-like/': ('Consulting', 'object-consulting-toolbox'),
    '/journal/gmail-vs-google-workspace-small-business/': ('Business email', 'object-mail'),
    '/answers/how-to-pick-a-pos-system/': ('Payments', 'object-payment-terminal'),
    '/journal/toast-vs-clover-nyc-bars/': ('Payments', 'object-payment-terminal'),
    '/journal/square-vs-toast-manhattan-restaurants/': ('Payments', 'object-payment-terminal'),
    '/journal/calendly-vs-square-appointments-nyc/': ('Booking', 'object-booking-calendar'),
    '/journal/square-appointments-vs-glossgenius-nyc-salons/': ('Booking', 'object-booking-calendar'),
    '/journal/how-to-stop-double-bookings-small-business/': ('Booking', 'object-booking-calendar'),
    '/journal/shopify-vs-squarespace-nyc-retail/': ('Online store', 'object-storefront'),
    # Help guides.
    '/answers/help/backup/': ('Files & backups', 'object-backup-drive'),
    '/answers/help/care/': ('Tech support', 'object-software-maintenance'),
    '/answers/help/computer/': ('Devices', 'object-desk-workstation'),
    '/answers/help/consulting-second-opinion/': ('Consulting', 'object-rubber-duck'),
    '/answers/help/consulting-tool-choice/': ('Consulting', 'object-consulting-toolbox'),
    '/answers/help/email/': ('Business email', 'object-mail'),
    '/answers/help/human/': ('Getting help', 'object-phone-dock'),
    '/answers/help/it-account-handoff/': ('Accounts & access', 'object-ownership-keys'),
    '/answers/help/it-domain-email-renewal/': ('Domains', 'object-renewal-hourglass'),
    '/answers/help/it-guest-network/': ('Wi-Fi & internet', 'object-router'),
    '/answers/help/it-home-work-boundary/': ('Devices', 'object-desk-workstation'),
    '/answers/help/it-internet-outage/': ('Wi-Fi & internet', 'object-router'),
    '/answers/help/it-license-renewal/': ('Software costs', 'object-renewal-hourglass'),
    '/answers/help/it-new-hire-access/': ('Accounts & access', 'object-password-safe'),
    '/answers/help/it-password-ownership/': ('Accounts & access', 'object-password-safe'),
    '/answers/help/it-payment-device-check/': ('Payments', 'object-payment-terminal'),
    '/answers/help/it-permission-review/': ('Security', 'object-security'),
    '/answers/help/it-phone-setup/': ('Phones', 'object-phone-dock'),
    '/answers/help/it-security-basics/': ('Security', 'object-security'),
    '/answers/help/it-shared-files/': ('Files & backups', 'object-shared-file-cabinet'),
    '/answers/help/it-shared-inbox-owner/': ('Business email', 'object-mail'),
    '/answers/help/it-software-updates/': ('Devices', 'object-software-maintenance'),
    '/answers/help/it-storage-full/': ('Files & backups', 'object-storage-drives'),
    '/answers/help/it-support-notes/': ('Tech support', 'object-notebook'),
    '/answers/help/it-vendor-handoff/': ('Tech support', 'object-vendor-handoff'),
    '/answers/help/it-video-call-room/': ('Video calls', 'object-video-meeting'),
    '/answers/help/maps/': ('Google & Maps', 'object-map-red-pin'),
    '/answers/help/move/': ('Office moves', 'object-construction-plans'),
    '/answers/help/onsite/': ('Tech support', 'object-consulting-toolbox'),
    '/answers/help/ownership/': ('Accounts & access', 'object-ownership-keys'),
    '/answers/help/printer/': ('Printers', 'object-printer'),
    '/answers/help/speed/': ('Speed', 'object-phone-chromatic'),
    '/answers/help/web-content-collection/': ('Websites', 'object-content-camera'),
    '/answers/help/web-homepage-priority/': ('Websites', 'object-homepage-sketchbook'),
    '/answers/help/wifi/': ('Wi-Fi & internet', 'object-network-switch'),
}

# Plain descriptions of each clay object, for alt text and image captions.
CLAY_ALT = {
    'object-approval-stamp': 'A handmade clay rubber stamp beside a checked card',
    'object-backup-drive': 'A handmade clay external drive with a yellow cable',
    'object-booking-calendar': 'A handmade clay desk calendar with a pencil',
    'object-construction-plans': 'A handmade clay hard hat, tape measure and building plans',
    'object-consulting-toolbox': 'A handmade clay wooden toolbox',
    'object-content-camera': 'A handmade clay camera with printed photos',
    'object-desk-workstation': 'A handmade clay desk with a small monitor and a plant',
    'object-homepage-sketchbook': 'A handmade clay sketchbook with a page layout drawn in it',
    'object-mail': 'A handmade clay envelope with a letter and a pen',
    'object-map-red-pin': 'A handmade clay map with a red location pin',
    'object-network-switch': 'A handmade clay network switch with a cable',
    'object-notebook': 'A handmade clay notebook and pencil beside a plant and a coffee cup',
    'object-ownership-keys': 'A handmade clay ring of keys with a leather tag',
    'object-password-safe': 'A handmade clay safe',
    'object-payment-terminal': 'A handmade clay card reader with a receipt and a card',
    'object-phone-chromatic': 'A handmade clay smartphone showing a website',
    'object-phone-dock': 'A handmade clay smartphone on a charging dock',
    'object-printer': 'A handmade clay office printer',
    'object-priority-notes': 'Handmade clay sticky notes',
    'object-redesign-paint': 'A handmade clay paint can and roller',
    'object-renewal-hourglass': 'A handmade clay hourglass',
    'object-repeat-work-machine': 'A handmade clay hand-cranked machine feeding out paper',
    'object-router': 'A handmade clay Wi-Fi router beside a plant',
    'object-rubber-duck': 'A handmade clay rubber duck',
    'object-scissors-red-tape': 'Handmade clay scissors cutting red tape',
    'object-security': 'A handmade clay folder locked with a padlock',
    'object-shared-file-cabinet': 'A handmade clay filing cabinet with an open drawer',
    'object-software-maintenance': 'A handmade clay screwdriver beside an open circuit-board tray',
    'object-storage-drives': 'A handmade clay storage unit with two drives',
    'object-storefront': 'A handmade clay neighborhood storefront',
    'object-vendor-handoff': 'A handmade clay leather folder with a USB key clipped to it',
    'object-video-meeting': 'A handmade clay webcam and speaker',
    'object-yellow-taxi-v1': 'A handmade clay New York yellow taxi',
    'symbol-browser': 'A handmade clay browser window',
    'symbol-tugboat': 'A handmade orange clay tugboat',
}

# Section heading -> icon. Specific phrases first, then topic words, then a calm default.
_SECTION_RULES = [
    (r'^what this means|^the details$', 'sparkle-duotone.svg'),
    (r'^what to watch|leave it alone|signs ', 'shield-check-duotone.svg'),
    (r'^do this next|^what to do first|^check this first|^before the visit|^what to include|^before you decide|first,', 'check-square-duotone.svg'),
    (r'^specific fixes', 'wrench-duotone.svg'),
    (r'when to bring in help|when to get help|^reach out when|when to pay for help', 'lifebuoy-duotone.svg'),
    (r'little fight checks|how the work starts|how we made it work', 'magnifying-glass-duotone.svg'),
    (r'question|quick answers|faq', 'chat-circle-dots-duotone.svg'),
    (r'^related', 'folders-duotone.svg'),
    (r'source|guidance|further reading|references', 'book-open-text-duotone.svg'),
    (r'little fight fits|your next move|talk to', 'handshake-duotone.svg'),
    (r'offline|internet|wi-?fi|network|router', 'wifi-high-duotone.svg'),
    (r'pay|card|tab|batch|deposit|price|charge|refund|processor|register|pos\b', 'credit-card-duotone.svg'),
    (r'book|calendar|appointment|schedul', 'calendar-check-duotone.svg'),
    (r'domain|registrar|dns', 'globe-hemisphere-west-duotone.svg'),
    (r'email|mail|inbox|reply|replies', 'envelope-simple-duotone.svg'),
    (r'review', 'quotes-duotone.svg'),
    (r'google|map|profile|local|nearby|neighborhood', 'map-pin-duotone.svg'),
    (r'\bai\b|chatgpt|assistant|crawler', 'sparkle-duotone.svg'),
    (r'export|data|record|file|backup|leave|leaving|way out|switch', 'database-duotone.svg'),
    (r'cost|bill|subscription|renew|seat|license', 'receipt-duotone.svg'),
    (r'contract|vendor|provider|designer|hire|hiring|freelanc', 'handshake-duotone.svg'),
    (r'password|account|access|owner|admin|sign', 'key-duotone.svg'),
    (r'law|legal|rule|ada|accessib|wcag', 'bank-duotone.svg'),
    (r'stock|inventory|store|shop|retail|sell', 'storefront-duotone.svg'),
    (r'custom|build|software|tool', 'puzzle-piece-duotone.svg'),
    (r'phone|text|call', 'phone-duotone.svg'),
    (r'test|check|measure', 'check-square-duotone.svg'),
    (r'website|site|page|search', 'browser-duotone.svg'),
]


def section_icon(heading):
    text = (heading or '').strip().lower()
    for pattern, icon in _SECTION_RULES:
        if re.search(pattern, text):
            return icon
    return 'list-duotone.svg'


def section_icon_html(heading):
    if not (heading or '').strip():
        return ''
    icon = escape(section_icon(heading), quote=True)
    return f'<span class="section-icon" aria-hidden="true" style="--section-icon:url(/assets/mineral/{icon})"></span>'


def article_topic(path):
    """(topic label, topic icon, clay object, alt text) for an article route, or None."""
    entry = ARTICLES.get(path)
    if not entry:
        return None
    label, asset = entry
    return label, TOPICS[label], asset, CLAY_ALT[asset] + '.'


assert set(label for label, _ in ARTICLES.values()) <= set(TOPICS), 'every topic needs an icon'
assert set(asset for _, asset in ARTICLES.values()) <= set(CLAY_ALT), 'every object needs alt text'
