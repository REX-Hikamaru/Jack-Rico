/* =====================================================
   Jack & Rico | main.js
   - Uncaught (in promise) Error 修正
   - メッセージチャンネルエラー対策
===================================================== */

// ナビバー スクロール効果
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });
}

// ハンバーガーメニュー
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'ナビゲーションメニューを開く');
  });

  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

function closeMenu() {
  if (!mobileMenu || !hamburger) return;
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileMenu.setAttribute('aria-hidden', 'true');
  hamburger.setAttribute('aria-label', 'ナビゲーションメニューを開く');
}

// タブ切替（menu.html）
function showTab(id, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => {
    p.classList.remove('active');
  });
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  const panel = document.getElementById('tab-' + id);
  if (panel) panel.classList.add('active');
  if (btn) {
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}

// 料金表画像の拡大表示
const imageModalTriggers = document.querySelectorAll('[data-image-modal]');
if (imageModalTriggers.length) {
  const imageModal = document.createElement('div');
  imageModal.className = 'image-modal';
  imageModal.setAttribute('aria-hidden', 'true');
  imageModal.hidden = true;
  imageModal.innerHTML = '<button class="image-modal-close" type="button" aria-label="画像を閉じる">×</button><img class="image-modal-image" alt="">';
  document.body.appendChild(imageModal);

  const modalImage = imageModal.querySelector('.image-modal-image');
  let modalTrigger = null;
  const closeImageModal = () => {
    if (modalTrigger) modalTrigger.focus();
    if (imageModal.contains(document.activeElement)) document.activeElement.blur();
    imageModal.classList.remove('is-open');
    imageModal.setAttribute('aria-hidden', 'true');
    imageModal.hidden = true;
    document.body.classList.remove('modal-open');
  };

  imageModalTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      modalTrigger = trigger;
      modalImage.src = trigger.dataset.imageModal;
      modalImage.alt = trigger.dataset.imageAlt || '';
      imageModal.hidden = false;
      imageModal.classList.add('is-open');
      imageModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    });
  });
  imageModal.querySelector('.image-modal-close').addEventListener('click', closeImageModal);
  imageModal.addEventListener('click', event => {
    if (event.target === imageModal) closeImageModal();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeImageModal();
  });
}

// フェードインアニメーション（IntersectionObserver）
// ※ try-catch で拡張機能干渉によるエラーを安全に無視
try {
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.fade-in').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
  }
} catch (err) {
  // フォールバック：全要素を表示
  document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
}

// スムーススクロール
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// 電話発信前の確認
document.addEventListener('click', event => {
  const phoneLink = event.target.closest('a[href^="tel:"]');
  if (!phoneLink) return;

  const confirmed = window.confirm(
    '電話をかける前にご確認ください。\n※営業電話はお断りしております。\nこの番号に電話をかけますか？'
  );
  if (!confirmed) event.preventDefault();
});

// ボトムナビ：現在ページをアクティブに
(function () {
  try {
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.bnav-link').forEach(a => {
      const href = a.getAttribute('href');
      if (href && href.includes(path)) {
        a.classList.add('active');
      }
    });
  } catch (e) {
    // エラーを無視
  }
})();

// ===================================================================
// Uncaught (in promise) Error 対策
// "A listener indicated an asynchronous response by returning true,
//  but the message channel closed before a response was received"
//
// これはブラウザ拡張機能（主にChrome拡張）が
// chrome.runtime.onMessage リスナーで true を返した後に
// レスポンスを送らずチャンネルが閉じた場合に発生するエラーです。
// サイト本体のコードではなく拡張機能側の問題のため、
// unhandledrejection イベントでキャッチして安全に無視します。
// ===================================================================
window.addEventListener('unhandledrejection', function (event) {
  const msg = event.reason && event.reason.message;
  if (
    msg &&
    msg.includes('message channel closed') ||
    (msg && msg.includes('listener indicated an asynchronous response'))
  ) {
    // 拡張機能由来のエラーをコンソールに表示しない
    event.preventDefault();
  }
});
