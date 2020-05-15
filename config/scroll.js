// $(document).ready(function () {
//     var Scrollbar = window.Scrollbar;

//     Scrollbar.use(window.OverscrollPlugin);

//     var customScroll = Scrollbar.init(document.querySelector('.js-scroll-list'), {
//         plugins: {
//             overscroll: true
//         }
//     });

//     var listItem = $('.js-scroll-list-item');

//     listItem.eq(0).addClass('item-focus');
//     listItem.eq(1).addClass('item-next');

//     customScroll.addListener(function (status) {

//         var $content = $('.js-scroll-content');

//         var viewportScrollDistance = 0;


//         viewportScrollDistance = status.offset.y;
//         var viewportHeight = $content.height();
//         var listHeight = 0;
//         var $listItems = $content.find('.js-scroll-list-item');
//         for (var i = 0; i < $listItems.length; i++) {
//             listHeight += $($listItems[i]).height();
//         }

//         var top = status.offset.y;
//         // console.log(top);
//         var visibleCenterVertical = 0;
//         visibleCenterVertical = top;

//         var parentTop = 1;
//         var $lis = $('.js-scroll-list-item');
//         var $focusLi;
//         for (var i = 0; i < $lis.length; i++) {
//             var $li = $($lis[i]);
//             var liTop = $li.position().top;
//             var liRelTop = liTop - parentTop;

//             var distance = 0;
//             var distance = Math.abs(top - liRelTop);
//             var maxDistance = $('.js-scroll-content').height() / 2;
//             var distancePercent = distance / (maxDistance / 100);


//             if (liRelTop + $li.parent().scrollTop() > top) {
//                 if (!$li.hasClass('item-focus')) {
//                     $li.prev().addClass('item-hide');
//                     $lis.removeClass('item-focus');
//                     $lis.removeClass('item-next');
//                 }
//                 $li.removeClass('item-hide');
//                 $li.addClass('item-focus');
//                 $li.next().addClass('item-next');
//                 break;
//             }
//         }
//     });

// });

// $(function () {
//     $('#search-menu').removeClass('toggled');

//     $('#search-icon').click(function (e) {
//         e.stopPropagation();
//         $('#search-menu').toggleClass('toggled');
//         $("#popup-search").focus();
//     });

//     $('#search-menu input').click(function (e) {
//         e.stopPropagation();
//     });

//     $('#search-menu, body').click(function () {
//         $('#search-menu').removeClass('toggled');
//     });
// });





// $(document).ready(function () {
//     var Scrollbar = window.Scrollbar;

//     Scrollbar.use(window.OverscrollPlugin);

//     var customScroll = Scrollbar.init(document.querySelector('.js-scroll-list-2'), {
//         plugins: {
//             overscroll: true
//         }
//     });

//     var listItem = $('.js-scroll-list-item-2');

//     listItem.eq(0).addClass('item-focus');
//     listItem.eq(1).addClass('item-next');

//     customScroll.addListener(function (status) {

//         var $content = $('.js-scroll-content-2');

//         var viewportScrollDistance = 0;


//         viewportScrollDistance = status.offset.y;
//         var viewportHeight = $content.height();
//         var listHeight = 0;
//         var $listItems = $content.find('.js-scroll-list-item-2');
//         for (var i = 0; i < $listItems.length; i++) {
//             listHeight += $($listItems[i]).height();
//         }

//         var top = status.offset.y;
//         // console.log(top);
//         var visibleCenterVertical = 0;
//         visibleCenterVertical = top;

//         var parentTop = 1;
//         var $lis = $('.js-scroll-list-item-2');
//         var $focusLi;
//         for (var i = 0; i < $lis.length; i++) {
//             var $li = $($lis[i]);
//             var liTop = $li.position().top;
//             var liRelTop = liTop - parentTop;

//             var distance = 0;
//             var distance = Math.abs(top - liRelTop);
//             var maxDistance = $('.js-scroll-content-2').height() / 2;
//             var distancePercent = distance / (maxDistance / 100);


//             if (liRelTop + $li.parent().scrollTop() > top) {
//                 if (!$li.hasClass('item-focus')) {
//                     $li.prev().addClass('item-hide');
//                     $lis.removeClass('item-focus');
//                     $lis.removeClass('item-next');
//                 }
//                 $li.removeClass('item-hide');
//                 $li.addClass('item-focus');
//                 $li.next().addClass('item-next');
//                 break;
//             }
//         }
//     });

// });




// //this is where we apply opacity to the arrow
// $(window).scroll(function () {

//     //get scroll position
//     var topWindow = $(window).scrollTop();
//     //multipl by 1.5 so the arrow will become transparent half-way up the page
//     var topWindow = topWindow * 1.5;

//     //get height of window
//     var windowHeight = $(window).height();

//     //set position as percentage of how far the user has scrolled 
//     var position = topWindow / windowHeight;
//     //invert the percentage
//     position = 1 - position;

//     //define arrow opacity as based on how far up the page the user has scrolled
//     //no scrolling = 1, half-way up the page = 0
//     $('.arrow-wrap').css('opacity', position);

// });




// //IIFE
// (function () {
//     "use strict";
//     var menuId;
//     function init() {
//         menuId = document.getElementById("menu");
//         document.addEventListener("scroll", scrollMenu, false);
//     }
//     function scrollMenu() {
//         if (document.documentElement.scrollTop > 50) {
//             menuId.classList.add("scroll");
//             console.log('scroll');
//         }
//         else {
//             menuId.classList.remove("scroll");
//             console.log('no-scroll');
//         }
//     }
//     document.addEventListener("DOMContentLoaded", init, false);
// })();

// (function () {
//     "use strict";
//     var mobBtn, topMenu;

//     function init() {
//         mobBtn = document.getElementById("mobile-btn");
//         topMenu = document.getElementById("top-menu");
//         mobBtn.addEventListener("click", mobileMenu, false);
//     }

//     function mobileMenu() {
//         if (topMenu.classList.contains("mobile-open")) {
//             topMenu.classList.remove("mobile-open");
//         } else {
//             topMenu.classList.add("mobile-open");
//         }
//         if (mobBtn.classList.contains("hamburger-cross")) {
//             mobBtn.classList.remove("hamburger-cross");
//         }
//         else {
//             mobBtn.classList.add("hamburger-cross");
//         }
//     }

//     document.addEventListener("DOMContentLoaded", init);

// })();