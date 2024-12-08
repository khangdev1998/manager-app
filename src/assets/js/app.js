$(document).ready(function () {
  $('.sidebar-menu__item[data-toggle="submenu"]').click(function (e) {
    e.preventDefault();
    $(this).next(".submenu").slideToggle();
    $(this).find("i").toggleClass("fa-chevron-down fa-chevron-up");
  });
});
