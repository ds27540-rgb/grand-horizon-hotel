document.addEventListener("DOMContentLoaded", () => {
    const roomListContainer = document.getElementById("room-list");
    const modal = document.getElementById("booking-modal");
    const closeModalBtn = document.getElementById("close-modal");
    const bookingForm = document.getElementById("booking-form");

    // ตั้งค่า วันเช็คอินเป็นวันนี้ และวันเช็คเอาท์เป็นพรุ่งนี้โดยอัตโนมัติ
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formatDate = (date) => date.toISOString().split("T")[0];
    
    document.getElementById("search-checkin").value = formatDate(today);
    document.getElementById("search-checkout").value = formatDate(tomorrow);
    document.getElementById("modal-checkin").value = formatDate(today);
    document.getElementById("modal-checkout").value = formatDate(tomorrow);

    // 1. Render รายการห้องพัก
    function renderRooms(rooms) {
        roomListContainer.innerHTML = "";
        rooms.forEach(room => {
            const card = document.createElement("div");
            card.className = "room-card";
            card.innerHTML = `
                <img src="${room.image}" alt="${room.name}">
                <div class="room-info">
                    <h3>${room.name}</h3>
                    <p>${room.description}</p>
                    <div class="room-price">฿${room.price.toLocaleString()} / คืน</div>
                    <button class="btn-primary" onclick="openBookingModal(${room.id})">จองห้องนี้</button>
                </div>
            `;
            roomListContainer.appendChild(card);
        });
    }

    // 2. คำนวณราคาและจำนวนคืน
    function calculateTotalPrice() {
        const checkin = new Date(document.getElementById("modal-checkin").value);
        const checkout = new Date(document.getElementById("modal-checkout").value);
        const roomId = document.getElementById("selected-room-id").value;
        
        const selectedRoom = roomsData.find(r => r.id == roomId);
        
        if (checkin && checkout && checkout > checkin && selectedRoom) {
            const diffTime = Math.abs(checkout - checkin);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            document.getElementById("total-nights").innerText = diffDays;
            document.getElementById("total-price").innerText = (diffDays * selectedRoom.price).toLocaleString();
        } else {
            document.getElementById("total-nights").innerText = 0;
            document.getElementById("total-price").innerText = 0;
        }
    }

    // 3. เปิด Modal สำหรับจองห้องพัก
    window.openBookingModal = function(roomId) {
        const room = roomsData.find(r => r.id === roomId);
        if (!room) return;

        document.getElementById("selected-room-id").value = room.id;
        document.getElementById("modal-room-name").value = room.name;

        // ดึงค่าวันเช็คอิน/เช็คเอาท์จากหน้า Search ด่วนมาใส่
        document.getElementById("modal-checkin").value = document.getElementById("search-checkin").value;
        document.getElementById("modal-checkout").value = document.getElementById("search-checkout").value;

        calculateTotalPrice();
        modal.style.display = "flex";
    };

    // Events สำหรับปิด Modal
    closeModalBtn.onclick = () => modal.style.display = "none";
    window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

    // ฟัง Event เมื่อมีการเปลี่ยนวันที่ใน Modal ให้คำนวณราคาใหม่
    document.getElementById("modal-checkin").addEventListener("change", calculateTotalPrice);
    document.getElementById("modal-checkout").addEventListener("change", calculateTotalPrice);

    // 4. บันทึกข้อมูลการจอง (จำลองกระบวนการ Success)
    bookingForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const bookingData = {
            bookingId: "BK-" + Math.floor(100000 + Math.random() * 900000),
            guestName: document.getElementById("guest-name").value,
            phone: document.getElementById("guest-phone").value,
            roomName: document.getElementById("modal-room-name").value,
            checkin: document.getElementById("modal-checkin").value,
            checkout: document.getElementById("modal-checkout").value,
            totalPrice: document.getElementById("total-price").innerText
        };

        // จำลองการบันทึกลง LocalStorage (แทนการส่งเข้า DB)
        const existingBookings = JSON.parse(localStorage.getItem("hotel_bookings") || "[]");
        existingBookings.push(bookingData);
        localStorage.setItem("hotel_bookings", JSON.stringify(existingBookings));

        alert(`การจองสำเร็จ!\nรหัสการจอง: ${bookingData.bookingId}\nคุณ ${bookingData.guestName}\nราคารวม: ฿${bookingData.totalPrice}`);
        
        bookingForm.reset();
        modal.style.display = "none";
    });

    // เริ่มต้นแสดงรายการห้องพัก
    renderRooms(roomsData);
});