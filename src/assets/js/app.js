$(document).ready(function () {
  // Sidebar menu
  $('.sidebar-menu__item[data-toggle="submenu"]').click(function (e) {
    e.preventDefault();
    $(this).next(".submenu").slideToggle();
    $(this).find("i").toggleClass("fa-chevron-down fa-chevron-up");
  });

  // When the modal is closed, the form is reset
  $("#staticBackdrop").on("hidden.bs.modal", function () {
    $("#productForm")[0].reset();
  });

  // Fetch data from API using AJAX
  const endpoint =
    "https://script.google.com/macros/s/AKfycbz4hnNHi9a7PZARmrXWuRuI-DTCE2zcxXuUJc1h7s_vqp8SVLv28yyJumeF08mVNk914A/exec";
  const table = $("#tableBody");

  // Function to attach event handlers to edit and delete buttons
  function attachEventHandlers() {
    $(".edit-btn").click(function () {
      const row = $(this).closest("tr");
      const id = row.data("id");
      const productCode = row.find("td:eq(1)").text();
      const productName = row.find("td:eq(2)").text();
      const category = row.find("td:eq(3)").text();
      const price = row.find("td:eq(4)").text();

      $("#productCode").val(productCode);
      $("#productName").val(productName);
      $("#productCategory").val(category);
      $("#productPrice").val(price);

      $("#staticBackdrop").modal("show");

      $(".btn-primary")
        .off("click")
        .on("click", function () {
          const updatedProduct = {
            productCode: $("#productCode").val(),
            productName: $("#productName").val(),
            category: $("#productCategory").val(),
            price: $("#productPrice").val(),
          };

          $.ajax({
            url: `${endpoint}/${id}`,
            method: "PUT",
            data: updatedProduct,
            success: function () {
              row.find("td:eq(1)").text(updatedProduct.productCode);
              row.find("td:eq(2)").text(updatedProduct.productName);
              row.find("td:eq(3)").text(updatedProduct.category);
              row.find("td:eq(4)").text(updatedProduct.price);
              $("#staticBackdrop").modal("hide");
            },
            error: function (error) {
              console.error("Error updating data", error);
            },
          });
        });
    });

    $(".delete-btn").click(function () {
      const row = $(this).closest("tr");
      const id = row.data("id");
      $.ajax({
        url: endpoint,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
          action: "DELETE",
          id: id,
        }),
        success: function (response) {
          row.remove();
          console.log("Delete success:", response);
        },
        error: function (error) {
          console.error("Error deleting data:", error);
        },
      });
    });
  }

  // Fetch data from API
  $.ajax({
    url: endpoint,
    method: "GET",
    success: function (data) {
      console.log(data);
      data.forEach((item) => {
        table.append(`
          <tr data-id="${item.id}">
            <td>${item.id}</td>
            <td>${item.code}</td>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.price}</td>
            <td>
              <button class="btn btn-sm btn-primary me-1 edit-btn">Sửa</button>
              <button class="btn btn-sm btn-danger delete-btn">Xóa</button>
            </td>
          </tr>
        `);
      });
      attachEventHandlers();
    },
    error: function (error) {
      console.error("Error fetching data", error);
    },
  });
});
