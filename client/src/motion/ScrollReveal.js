import { useEffect } from 'react';

// Scroll-driven enter / leave animations for the whole UI, with no per-component wiring.
// Watches <main> and tags card-like elements with `data-reveal`; motion.css does the animating.
// States: hidden → in-down|in-up (entering) → out-up|out-down (leaving the viewport).

const CARD_LIKE =
  '.MuiCard-root, .MuiPaper-root, .MuiAlert-root, .MuiAccordion-root, .MuiTableContainer-root, [data-animate]';
const HEADINGS = '.MuiTypography-h1, .MuiTypography-h2, .MuiTypography-h3, .MuiTypography-h4, .MuiTypography-h5';
const CANDIDATES = `${CARD_LIKE}, ${HEADINGS}`;
const SKIP = '[data-no-reveal], .MuiAppBar-root, .MuiMenu-paper, .MuiPopover-paper';

const STAGGER_MS = 70;
const MAX_STAGGER = 10;

const isEligible = (el) => {
  if (el.hasAttribute('data-reveal') || el.closest(SKIP)) return false;
  // Only animate the outermost card-like element so nested content moves as one unit.
  if (el.parentElement?.closest('[data-reveal]')) return false;
  // A wrapper that holds several cards is a layout container: let its children animate instead.
  if (el.matches(CARD_LIKE) && el.querySelectorAll(CARD_LIKE).length >= 2) return false;
  return true;
};

export default function ScrollReveal() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    const shown = new WeakSet();

    const io = new IntersectionObserver(
      (entries) => {
        const entering = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);

        entering.forEach((entry, i) => {
          const el = entry.target;
          const fromBelow = entry.boundingClientRect.top > (entry.rootBounds?.height ?? window.innerHeight) / 2;
          el.style.setProperty('--reveal-delay', `${Math.min(i, MAX_STAGGER) * STAGGER_MS}ms`);
          el.setAttribute('data-reveal', fromBelow ? 'in-down' : 'in-up');
          shown.add(el);
        });

        entries.forEach((entry) => {
          if (entry.isIntersecting) return;
          const el = entry.target;
          // Never been visible yet: stay hidden without playing a leave animation.
          if (!shown.has(el)) return;
          const above = entry.boundingClientRect.top < (entry.rootBounds?.height ?? window.innerHeight) / 2;
          el.style.setProperty('--reveal-delay', '0ms');
          el.setAttribute('data-reveal', above ? 'out-up' : 'out-down');
        });
      },
      { rootMargin: '-64px 0px -5% 0px', threshold: 0 }
    );

    const tag = (root) => {
      if (root.nodeType !== 1) return;
      const nodes = root.matches(CANDIDATES) ? [root] : [];
      nodes.push(...root.querySelectorAll(CANDIDATES));
      nodes.forEach((el) => {
        if (!isEligible(el)) return;
        el.setAttribute('data-reveal', 'hidden');
        io.observe(el);
      });
    };

    const untag = (root) => {
      if (root.nodeType !== 1) return;
      if (root.hasAttribute('data-reveal')) io.unobserve(root);
      root.querySelectorAll('[data-reveal]').forEach((el) => io.unobserve(el));
    };

    const inMain = (node) => {
      const main = document.querySelector('main');
      return main && node.nodeType === 1 && main.contains(node);
    };

    const mo = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.removedNodes.forEach(untag);
        m.addedNodes.forEach((node) => inMain(node) && tag(node));
      });
    });

    const main = document.querySelector('main');
    if (main) tag(main);
    mo.observe(document.body, { childList: true, subtree: true });

    // An IntersectionObserver reports the geometry it saw at observe() time.
    // On mount that is before the browser has finished laying the page out,
    // so elements that really are on screen come back as non-intersecting,
    // get left at `hidden`, and never recover — nothing moves them again, so
    // no second callback ever fires. It showed up as page headings, stat
    // tiles and filter bars rendering invisible until the user scrolled.
    //
    // Re-observing after layout has settled makes the observer re-deliver
    // with correct geometry, reusing the callback above rather than
    // duplicating its logic. Elements added later (feed items, search
    // results) already arrive this way via the MutationObserver.
    //
    // Tagging still happens synchronously above: deferring it would let the
    // content paint at full opacity and then snap to hidden.
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        document.querySelectorAll('[data-reveal="hidden"]').forEach((el) => {
          io.unobserve(el);
          io.observe(el);
        });
      });
    });

    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  return null;
}
