/* 《建筑风格》构架图 — 交互脚本 */
(function () {
  'use strict';

  /* ---------- 阅读进度 ---------- */
  var fill = document.getElementById('progress-fill');
  function progress() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (fill) fill.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  }

  /* ---------- 滚动显现 ---------- */
  var lazy = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    lazy.forEach(function (el) { io.observe(el); });
  } else {
    lazy.forEach(function (el) { el.classList.add('revealed'); });
  }

  /* ---------- 构架树：点击展开 / 收起 ---------- */
  document.querySelectorAll('.tree-head').forEach(function (head) {
    head.addEventListener('click', function () {
      var node = head.parentNode;
      node.classList.toggle('open');
    });
  });

  /* ---------- 条目卡筛选 ---------- */
  var filterBtns = document.querySelectorAll('.filters button');
  var cards = Array.prototype.slice.call(document.querySelectorAll('#p1 .card'));
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.dataset.filter;
      cards.forEach(function (c) {
        c.classList.toggle('hidden', f !== 'all' && c.dataset.era !== f);
      });
      // 卡片数量变化后重建 lightbox 索引
      rebuildGallery();
    });
  });

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById('lightbox');
  var lbImg = lb.querySelector('img');
  var lbCap = lb.querySelector('figcaption');
  var visible = [];
  var idx = 0;

  function rebuildGallery() {
    visible = cards.filter(function (c) { return !c.classList.contains('hidden'); });
  }

  function captionOf(card) {
    var t = card.querySelector('h4');
    var m = card.querySelector('.meta-line');
    var f = card.querySelector('.card-foot');
    var parts = [];
    if (t) parts.push(t.textContent.trim());
    if (m) parts.push(m.textContent.trim());
    if (f) parts.push(f.textContent.replace(/^图上：/, '图片来源：').trim());
    return parts.join(' ｜ ');
  }

  function openLB(card) {
    rebuildGallery();
    idx = visible.indexOf(card);
    if (idx < 0) idx = 0;
    showLB();
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function showLB() {
    var c = visible[idx];
    if (!c) return;
    var img = c.querySelector('img');
    lbImg.src = img.getAttribute('src');
    lbImg.alt = img.getAttribute('alt') || '';
    lbCap.textContent = captionOf(c) + '   (' + (idx + 1) + ' / ' + visible.length + ')';
  }

  function closeLB() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  function step(d) {
    if (!visible.length) return;
    idx = (idx + d + visible.length) % visible.length;
    showLB();
  }

  document.querySelectorAll('#p1 .thumb').forEach(function (th) {
    th.addEventListener('click', function () {
      var card = th.closest('.card');
      if (card) openLB(card);
    });
  });

  lb.querySelector('.lb-close').addEventListener('click', closeLB);
  lb.querySelector('.lb-prev').addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
  lb.querySelector('.lb-next').addEventListener('click', function (e) { e.stopPropagation(); step(1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLB(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLB();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  /* ---------- 导航高亮 ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  function navHighlight() {
    var pos = window.pageYOffset + 160;
    var current = 0;
    sections.forEach(function (s, i) { if (s && s.offsetTop <= pos) current = i; });
    navLinks.forEach(function (a, i) { a.classList.toggle('active', i === current); });
  }

  /* ---------- 回到顶部 ---------- */
  var toTop = document.getElementById('toTop');
  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  function toggleTop() { toTop.classList.toggle('show', window.pageYOffset > 600); }

  /* ---------- 滚动监听（合并，rAF 节流） ---------- */
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      progress(); navHighlight(); toggleTop();
      ticking = false;
    });
  }, { passive: true });

  rebuildGallery();
  progress(); navHighlight(); toggleTop();
  window.addEventListener('load', function () { progress(); navHighlight(); });
})();
