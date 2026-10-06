"""One authored answer source for static readers, category Q&A and JSON-LD."""
from html import escape
import json
from service_taxonomy import override_family

CATEGORY_NAMES = {'web': 'Website', 'it': 'Tech support', 'consulting': 'Consulting', 'software': 'Custom software'}
EXPECTED_COUNTS = {'web': 27, 'it': 28, 'consulting': 6, 'software': 8}
CONTENT_UPDATED = '2026-10-03'
EXTRA_MEMBERS = {
    'maps': ['web-reviews-response'],
    'consulting-tool-choice': ['web-newsletter-choice', 'web-multilingual-start'],
    'web-content-collection': ['web-events-calendar'],
    'page-industries': ['web-ecommerce-inventory'],
}
CATEGORY_SECTIONS = {
    'it': [
        {'heading': 'Show us where work stops.', 'paragraphs': [
            'The printer that disappeared. The Wi-Fi that drops in the back room. The email you sent that never arrived.',
            'Tell us what happened and what you need to keep doing. We check the cause, explain the options, and agree on the work before changing your setup.'
        ]},
        {'heading': 'Keep the fix understandable.', 'paragraphs': [
            'You get a plain account of what changed and how to use it. Your accounts stay under your control.',
            'If the internet provider or another vendor needs to act, we identify the next step and the information they need.'
        ]},
    ],
    'consulting': [
        {'heading': 'Put the decision on the table.', 'paragraphs': [
            'Bring a quote you cannot make sense of, a subscription bill that keeps growing, or a task your team keeps working around.',
            'We look at what you already have, who uses it, and what is getting in the way. Working tools get to stay.'
        ]},
        {'heading': 'Leave with a decision you understand.', 'paragraphs': [
            'You get the options in plain language: what to change, what it depends on, and what can wait.',
            'If a repair, an existing tool, or a simpler routine solves the problem, that belongs in the recommendation.'
        ]},
    ],
    'software': [
        {'heading': 'Walk us through one real task.', 'paragraphs': [
            'Show us how an order, approval, booking, or report moves through the business. The copied spreadsheet and the missing handoff tell us where to look.',
            'We compare a small custom tool with the software you already pay for. Building starts when we can name the job it will do.'
        ]},
        {'heading': 'Try the smallest useful version.', 'paragraphs': [
            'We agree on one working step, who will use it, and how to check that it helps. Your team tries it with a safe sample before relying on it.',
            'The handoff includes account ownership, instructions, and the agreed care plan. Any paid services and their terms are explained before you commit.'
        ], 'links': [{'label': 'Explore our products +', 'href': '/examples/#our-products'}]},
    ],
}


def load_rewrite(content):
    web = json.loads((content / 'rewrite-web.json').read_text())
    support = json.loads((content / 'rewrite-support.json').read_text())
    hooks = json.loads((content / 'rewrite-hooks.json').read_text())
    answers = [dict(item, category='web') for item in web['answers']] + support['answers']
    assert len({item['id'] for item in answers}) == 69, 'Rewrite requires 69 distinct service questions'
    for family, count in EXPECTED_COUNTS.items():
        assert sum(item['category'] == family for item in answers) == count, f'Incomplete {family} rewrite'
    for item in answers:
        assert all(item.get(key) for key in ('id', 'question', 'answer', 'detail', 'nextStep'))
        item['category'] = override_family(identity=item['id']) or item['category']
    return {
        'answers': {item['id']: item for item in answers},
        'categories': {item['path']: item for item in [web['category'], *support['categories']]},
        'industries': web['industries'], 'hooks': hooks,
        'groupIntros': {**web.get('groupIntros', {}), **support.get('groupIntros', {})},
    }


def apply_catalog_hooks(rewrite, cases, labs, albums):
    hooks = rewrite['hooks']
    assert set(hooks['cases']) == set(cases), 'Case hooks must match the approved public catalog'
    assert set(hooks['labs']) == {item['slug'] for item in labs}, 'Lab hook coverage changed'
    assert set(hooks['albums']) == {item['id'] for item in albums}, 'Album hook coverage changed'
    for slug, item in cases.items():
        item.update(hooks['cases'][slug])
    for item in labs:
        item.update(hooks['labs'][item['slug']])
    for item in albums:
        item['caption'] = hooks['albums'][item['id']]['summary']


def answer_section(item, *, include_next=True):
    paragraphs = [item['answer'], item['detail']]
    if include_next:
        paragraphs.append(item['nextStep'])
    return {'id': 'answer-' + item['id'], 'heading': item['question'], 'paragraphs': paragraphs}


def prepare_groups(groups, rewrite):
    """Replace verbose chapters, retaining group identities, art and destinations."""
    by_id = rewrite['answers']
    for group in groups:
        group['family'] = override_family(identity=group['id'], path=group['path']) or group['family']
        intro = rewrite['groupIntros'].get(group['id'], {})
        group.update({key: intro[key] for key in ('heading', 'summary') if key in intro})
        # The website anchor keeps its bespoke illustrated story and terms FAQ.
        if group.get('preserveReader'):
            # The rewritten cost answer covers the quote once in the category
            # collection; do not repeat it as a second introductory FAQ.
            group['faqs'] = []
            continue
        # The other service anchors introduce their whole subject, then provide
        # their complete answer collection once in the category disclosure.
        if group['path'] in rewrite['categories']:
            category = rewrite['categories'][group['path']]
            group.update(heading=category['title'], summary=category['summary'],
                         sections=CATEGORY_SECTIONS[category['id']], faqs=[])
            continue
        members = [group['id'], *group['absorb'], *EXTRA_MEMBERS.get(group['id'], [])]
        chapters = []
        if group['id'] == 'web-content-collection':
            chapters.append({'heading': 'Bring what you have.', 'paragraphs': [
                'Start with your services, current contact details, business photos, and the questions customers ask you. Rough notes are fine.',
                'We write the pages with you and help find the gaps. You approve the business facts before anything is published.'
            ]})
        if group['id'] == 'page-industries':
            for path, item in rewrite['industries'].items():
                chapters.append({'heading': item['title'], 'paragraphs': [item['summary']],
                                 'links': [{'label': 'See the details +', 'href': path}]})
            chapters.append({'heading': 'Appointments, shops, and nights out.', 'paragraphs': [
                'A salon needs an easy booking path. A bar needs tonight’s plan and a readable menu. A shop needs a way to browse, visit, or buy.',
                'We build around the way your customers choose, using the booking and payment tools you already rely on.'
            ], 'links': [{'label': 'See the work +', 'href': '/examples/'}]})
        chapters.extend(answer_section(by_id[key]) for key in members if key in by_id)
        chapters.extend(intro.get('supplementalSections', []))
        if chapters:
            group['sections'] = chapters
            group['faqs'] = []
            group['servicePath'] = next(path for path, item in rewrite['categories'].items() if item['id'] == group['family'])


def apply_page_rewrite(pages, authored, rewrite):
    for identity, item in rewrite['answers'].items():
        path = '/answers/help/' + identity + '/'
        assert path in pages, f'Rewrite must preserve an existing answer: {path}'
        p = pages[path]
        if p.get('_homeGroup'):
            continue
        # These cards used to append an entire older article after the answer.
        # The linked archive survives; the card now gives one complete answer.
        for key in ('answerContent', 'contentBlocks', 'sourceDepth', 'extraHtml'):
            p.pop(key, None)
        p.update(heading=item['question'], title=item['question'] + ' | Little Fight NYC',
                 summary=item['answer'], description=item['answer'], family=item['category'],
                 sections=[{'heading': '', 'paragraphs': [item['detail']]}],
                 contactPrompt=item['nextStep'], _rewriteAnswer=identity,
                 _servicePath=next(path for path, category in rewrite['categories'].items() if category['id'] == item['category']))
        authored[path] = p
    for path, item in rewrite['categories'].items():
        p = pages[path]
        p.update(heading=item['title'], summary=item['summary'], title=item['metaTitle'],
                 description=item['metaDescription'], family=item['id'], _rewriteCategory=item['id'])
        # Generic imported pages must not override the authored category copy.
        for key in ('answerContent', 'marketContent', 'contentBlocks', 'sourceDepth'):
            p.pop(key, None)
        if item['id'] in CATEGORY_SECTIONS:
            p['sections'] = CATEGORY_SECTIONS[item['id']]
            p['faqs'] = []
        authored[path] = p
    for path, item in rewrite['industries'].items():
        p = pages[path]
        p.update(heading=item['title'], summary=item['summary'], description=item.get('metaDescription', item['summary']))
        if item.get('sections'):
            p['sections'] = item['sections']
        authored[path] = p
    for identity, item in rewrite['hooks']['albums'].items():
        path = '/photos/' + identity.removeprefix('album-') + '/'
        p = pages[path]
        p.update(summary=item['summary'], description=item['summary'],
                 sections=[{'heading': row['heading'], 'paragraphs': [row['body']]} for row in item['sections']])
        authored[path] = p
    for path, item in rewrite['hooks']['markets'].items():
        p = pages[path]
        p['summary'] = item['summary']
        p['description'] = item['summary']
        p['eyebrow'] = 'Local business guide'
        p['family'] = 'consulting'
        if p.get('marketContent'):
            p['marketContent']['introduction'] = item['summary']
        authored[path] = p
    for path, item in rewrite['hooks']['brand'].items():
        if path in pages:
            pages[path].update(heading=item['title'], summary=item['summary'], description=item.get('metaDescription', item['summary']))
            authored[path] = pages[path]
    # Case/Lab summaries are read from their catalogs by normalize(). Mark these
    # authored so the retired summary overlay cannot put the old hook back.
    for path, page in pages.items():
        if path.startswith(('/case-studies/', '/examples/lab/concepts/')):
            authored[path] = page


def category_answers(rewrite, family):
    return [item for item in rewrite['answers'].values() if item['category'] == family]


def answer_text(item):
    return ' '.join(item[key] for key in ('answer', 'detail', 'nextStep'))


def render_category_answers(rewrite, family):
    """Native disclosure keeps every question in the initial static document."""
    rows = []
    for item in category_answers(rewrite, family):
        rows.append('<section class="category-answer" id="answer-' + escape(item['id']) + '"><h3>' +
                    escape(item['question']) + '</h3>' + ''.join('<p>' + escape(item[key]) + '</p>'
                    for key in ('answer', 'detail', 'nextStep')) + '</section>')
    return '<section class="category-questions" id="questions"><details><summary><h2>' + CATEGORY_NAMES[family] + \
           ' questions</h2><span aria-hidden="true">+</span></summary><div class="category-answer-list">' + \
           ''.join(rows) + '</div></details></section>'


def category_schema(rewrite, family, origin, path):
    """FAQPage describes visible Q&A; Google retired its FAQ rich result in 2026."""
    return {'@type': 'FAQPage', '@id': origin + path + '#questions', 'url': origin + path + '#questions',
            'isPartOf': {'@id': origin + path + '#webpage'},
            'mainEntity': [{'@type': 'Question', 'name': item['question'],
                            'acceptedAnswer': {'@type': 'Answer', 'text': answer_text(item)}}
                           for item in category_answers(rewrite, family)]}


def rewritten_paths(rewrite):
    """Content revision date belongs only to pages whose copy changed."""
    return set(rewrite['categories']) | set(rewrite['industries']) | set(rewrite['hooks']['brand']) | \
           set(rewrite['hooks']['markets']) | {'/examples/'} | \
           {'/case-studies/' + slug + '/' for slug in rewrite['hooks']['cases']} | \
           {'/photos/' + identity.removeprefix('album-') + '/' for identity in rewrite['hooks']['albums']} | \
           {'/answers/help/' + identity + '/' for identity in rewrite['answers']}
