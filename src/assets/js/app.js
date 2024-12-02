$(document).ready(function () {
   // Mảng chứa dữ liệu từ API
   let allRequests = [];
 
   // Hiển thị spinner khi đang tải dữ liệu
   $("#loadingSpinner").show();
 
   // Render dữ liệu vào bảng
   $.get(
     "https://my-json-server.typicode.com/khangdev1998/manager-data/requests",
     function (data) {
       allRequests = data; // Lưu dữ liệu vào mảng allRequests
       console.log(allRequests);
 
       // Ẩn spinner và hiển thị bảng khi dữ liệu đã được tải xong
       $("#loadingSpinner").hide();
 
       // Render bảng
       data.forEach(function (item, index) {
         // Dùng 'index' làm 'data-id'
         let row = `<tr class="request-row" data-id="${index}">
           <td>${item.type}</td>
           <td>${item.phone_number}</td>
           <td>${item.user_name}</td>
           <td>${item.description}</td>
           <td>${item.request_date}</td>
         </tr>`;
         $("#request-table-body").append(row);
       });
 
       // Xử lý khi click vào mỗi row để hiển thị modal với thông tin chi tiết
       $(".request-row").click(function () {
         const requestIndex = $(this).data("id"); // Lấy chỉ số của request từ 'data-id'
 
         // Tìm chi tiết yêu cầu từ mảng allRequests bằng index
         const requestDetails = allRequests[requestIndex]; // Dùng chỉ số để lấy chi tiết yêu cầu
 
         console.log(requestDetails, requestIndex); // Kiểm tra console để debug
 
         // Kiểm tra nếu tìm thấy yêu cầu
         if (requestDetails) {
           $("#modalContent").html(`
             <div class="card">
               <div class="card-body">
                 <h5 class="card-title">Details for ${requestDetails.user_name}</h5> <!-- Hiển thị tên người dùng -->
                 <ul class="list-group list-group-flush">
                   <li class="list-group-item"><strong>Asset Name:</strong> ${requestDetails.details.assets_name}</li>
                   <li class="list-group-item"><strong>Serial Number:</strong> ${requestDetails.details.serial_number}</li>
                   <li class="list-group-item"><strong>Asset Type:</strong> ${requestDetails.details.asset_type}</li>
                   <li class="list-group-item"><strong>Asset Category:</strong> ${requestDetails.details.asset_category}</li>
                   <li class="list-group-item"><strong>Actual Return Date:</strong> ${requestDetails.details.actual_return_date}</li>
                 </ul>
               </div>
             </div>
           `);
           $("#userModal").modal("show"); // Hiển thị modal
         } else {
           alert("Details not found");
         }
       });
     }
   ).fail(function () {
     alert("Error fetching data");
   });
 });
 