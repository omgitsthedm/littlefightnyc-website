"""David Marsh, founder: the named person behind Little Fight NYC.

Owner decision (2026-10-19): "if I have to be the face that's fine, David Marsh
or just David." The site still publishes as Little Fight NYC; David is its named
founder, the author of its articles, and the person who answers.
"""
from html import escape

ORIGIN = 'https://littlefightnyc.com'
DAVID_ID = ORIGIN + '/#david-marsh'
DAVID_NAME = 'David Marsh'
DAVID_ROLE = 'Founder, Little Fight NYC'
DAVID_URL = '/about/#david'
PORTRAIT_JPG = '/assets/people/david-marsh-640.jpg'
PORTRAIT_ALT = 'David Marsh, founder of Little Fight NYC'


def avatar(css_px, cls='person-avatar', alt=''):
    """David's round portrait at the right pixel density for its displayed size."""
    srcset = ', '.join(f'/assets/people/david-marsh-{w}.webp {w}w' for w in (96, 192, 320, 640))
    return (f'<img class="{escape(cls, quote=True)}" src="/assets/people/david-marsh-192.webp" srcset="{srcset}" '
            f'sizes="{css_px}px" width="{css_px}" height="{css_px}" alt="{escape(alt, quote=True)}" loading="lazy" decoding="async">')


def person_schema():
    return {'@type': 'Person', '@id': DAVID_ID, 'name': DAVID_NAME, 'givenName': 'David', 'familyName': 'Marsh',
            'jobTitle': 'Founder', 'worksFor': {'@id': ORIGIN + '/#organization'}, 'url': ORIGIN + DAVID_URL,
            'image': {'@type': 'ImageObject', 'url': ORIGIN + PORTRAIT_JPG, 'width': 640, 'height': 640, 'caption': PORTRAIT_ALT},
            'telephone': '+16463600318', 'email': 'hello@littlefightnyc.com',
            'knowsAbout': ['Small business websites', 'IT support', 'Microsoft 365', 'Google Workspace', 'Wi-Fi and networking',
                           'Local search', 'Custom business software'],
            'address': {'@type': 'PostalAddress', 'addressLocality': 'New York', 'addressRegion': 'NY', 'addressCountry': 'US'}}
