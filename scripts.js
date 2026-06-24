// MASTER DATA STRUCTURE
const masterData = {
    'DFOuter': {
        name: 'DF-OUTTER',
        groups: {
            'group_m1': {
                name: 'ปัญหาด้านเครื่องจักร (Machine)',
                problems: [
                    'เครื่อง Alarm',
                    'Sensor ไม่อ่านค่า',
                    'เครื่องดับ'
                ]
            },
            'group_s1': {
                name: 'ปัญหาด้านความปลอดภัย (Safety)',
                problems: [
                    'Oil Leak on Floor (คราบน้ำมันรั่วบนพื้น)',
                    'Emergency Button Blocked (สิ่งของบังปุ่มฉุกเฉิน)',
                    'Defective Safety Guard (ฝาครอบป้องกันเสียหาย)'
                ]
            }
        }
    },
    'FTest': {
        name: 'F-Test',
        groups: {
            'group_cnc': {
                name: 'ปัญหาด้านเครื่องจักร (Machine)',
                problems: [
                    'ลูกกลิ้งไม่หมุน',
                    'ลมไม่เข้าเครื่อง',
                    'มอเตอร์มีเสียงดัง'
                ]
            }
        }
    },
    'INNERG': {
        name: 'INNER-G',
        groups: {
            'group_pack': {
                name: 'ปัญหาด้านเครื่องจักร (Machine)',
                problems: [
                    'boiler จุดไม่ติด',
                    'calibation ไม่ผ่าน',
                    'layer shift หลังบอนดิ้ง'
                ]
            }
        }
    }
};

// User Session State
let currentUser = {
    id: '6902585',
    name: 'วีระพล สุภาโชค',
    section: 'DF-OUTTER',
    points: 140,
    isAnonymous: false
};

// Mock Reported History Database
let reportHistory = [
    {
        id: 'PMC-2026-001',
        section: 'DF-OUTTER',
        group: 'ปัญหาด้านเครื่องจักร (Machine)',
        problem: 'เครื่อง Alarm',
        detail: 'เครื่องจักรหยุดการทำงานกะทันหัน มีไซเรนสีแดงแจ้งเตือนสถานะความผิดพลาด',
        image: 'machine_error_04.jpg',
        status: 'Accepted',
        statusText: 'ตรวจรับแล้ว',
        pointsEarned: 10,
        date: '24 มิ.ย. 2026 | 09:30'
    },
    {
        id: 'PMC-2026-002',
        section: 'DF-OUTTER',
        group: 'ปัญหาด้านความปลอดภัย (Safety)',
        problem: 'Oil Leak on Floor (คราบน้ำมันรั่วบนพื้น)',
        detail: 'พบคราบน้ำมันไฮดรอลิกรั่วซึมบริเวณพื้นใต้โครงเครื่องจักร',
        image: null,
        status: 'In Progress',
        statusText: 'กำลังดำเนินงาน',
        pointsEarned: 4,
        date: '23 มิ.ย. 2026 | 14:15'
    }
];

// UI Global State Variables
let attachedImageBase64 = null;
let isMasterProblemSelected = false;
let currentGeneratedTicketId = "";

// INSTANT QUICK TRACK BY ID LOGIC
function quickTrackTicket() {
    const trackInput = document.getElementById('quick-track-id');
    const ticketIdInput = trackInput.value.trim().toUpperCase();

    if (!ticketIdInput) {
        alert("❌ กรุณากรอกรหัสติดตามปัญหาก่อนสแกนค้นหา!");
        return;
    }

    // Find ticket from global dataset
    const ticket = reportHistory.find(item => item.id.toUpperCase() === ticketIdInput);

    if (ticket) {
        renderTrackingModal(ticket);
    } else {
        alert(`❌ ไม่พบรหัสปัญหา "${ticketIdInput}" ในระบบโรงงานส่วนกลาง กรุณาตรวจสอบตัวอักษรและตัวเลขอีกครั้ง`);
    }
}

function renderTrackingModal(ticket) {
    const modalContent = document.getElementById('modal-tracking-content');

    let statusBadgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
    let statusDot = "bg-amber-400 animate-pulse";
    let statusDescText = "ทีมงานส่วนกลางกำลังวิเคราะห์ข้อมูลเพื่อส่งมอบหมายงานให้ผู้รับผิดชอบ (Section Leader)";

    if (ticket.status === 'Accepted') {
        statusBadgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        statusDot = "bg-emerald-500";
        statusDescText = "งานนี้ได้รับการแก้เสร็จสิ้นและผู้ดูแลระบบตรวจสอบความถูกต้องเรียบร้อยแล้ว";
    } else if (ticket.status === 'In Progress') {
        statusBadgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
        statusDot = "bg-blue-500 animate-pulse";
        statusDescText = "งานถูกส่งไปที่หน่วยงานเพื่อดำเนินการแก้ไขเรียบร้อยแล้ว";
    } else if (ticket.status === 'Rejected') {
        statusBadgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
        statusDot = "bg-rose-500";
        statusDescText = "ไม่พบรายงานข้อผิดพลาดหน้างานจริงตามข้อมูล หรือรายละเอียดรายงานไม่เพียงพอ";
    }

    modalContent.innerHTML = `
                <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                    <div class="flex justify-between items-center">
                        <span class="text-xs font-bold text-slate-500 font-numeric tracking-wide">${ticket.id}</span>
                        <span class="text-[10px] text-slate-500 font-numeric">${ticket.date}</span>
                    </div>
                    
                    <div class="space-y-1">
                        <div class="text-[10px] text-emerald-400 font-semibold">${ticket.section}</div>
                        <h4 class="text-sm font-bold text-slate-100">${ticket.problem}</h4>
                        <p class="text-xs text-slate-400">${ticket.detail ? ticket.detail : 'ไม่ได้ระบุรายละเอียดเพิ่มเติม'}</p>
                    </div>

                    ${ticket.image ? `
                    <div class="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center gap-2">
                        <i class="fa-solid fa-paperclip text-slate-500 text-xs"></i>
                        <span class="text-[10px] text-slate-500">มีรูปถ่ายแนบรายงานเป็นหลักฐาน</span>
                    </div>` : ''}
                </div>

                <!-- Live Status Timeline Indicator -->
                <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4">
                    <div class="flex justify-between items-center">
                        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">สถานะการทำงานสด</span>
                        <div class="flex items-center gap-1.5 py-0.5 px-3 rounded-full border text-[10px] font-bold ${statusBadgeColor}">
                            <span class="w-1.5 h-1.5 rounded-full ${statusDot}"></span>
                            ${ticket.statusText}
                        </div>
                    </div>
                    <p class="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800/50 leading-relaxed">
                        <i class="fa-solid fa-circle-info text-emerald-400 mr-1"></i> ${statusDescText}
                    </p>
                </div>
            `;

    // Display modal
    document.getElementById('modal-tracking').classList.remove('hidden');
}

function closeTrackingModal() {
    document.getElementById('modal-tracking').classList.add('hidden');
}

function copyTicketId() {
    // Simulated copy using mandatory rules
    const dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = currentGeneratedTicketId;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);

    alert("📋 คัดลอกรหัสปัญหาเรียบร้อยแล้ว: " + currentGeneratedTicketId);
}

function loginAs(id, name, section, points) {
    currentUser = { id, name, section, points, isAnonymous: false };
    setupDashboard();
    showScreen('dashboard');
}

function loginAnonymous() {
    currentUser = {
        id: 'ANON-PMC',
        name: 'ไม่ระบุตัวตน (Anonymous)',
        section: 'ไม่ได้ระบุ',
        points: 0,
        isAnonymous: true
    };
    setupDashboard();
    showScreen('dashboard');
}

function setupDashboard() {
    document.getElementById('user-display-name').innerText = currentUser.name;
    document.getElementById('user-display-points').innerText = currentUser.points;
    document.getElementById('user-avatar').innerText = currentUser.isAnonymous ? "AN" : getInitials(currentUser.name);
    document.getElementById('user-rank-avatar').innerText = currentUser.isAnonymous ? "AN" : getInitials(currentUser.name);
    document.getElementById('user-rank-name').innerText = currentUser.isAnonymous ? "ไม่ระบุตัวตน (คุณ)" : `${currentUser.name} (คุณ)`;
    document.getElementById('user-rank-points').innerText = currentUser.points;

    const rankSec = document.getElementById('user-rank-section');
    if (rankSec) {
        rankSec.innerText = currentUser.section;
    }

    const tabHistory = document.getElementById('tab-history');

    // Handle points element visibility and tab history status if Anonymous
    if (currentUser.isAnonymous) {
        document.getElementById('user-display-points').parentElement.classList.add('opacity-40');

        // Disable My History tab button
        tabHistory.disabled = true;
        tabHistory.classList.add('opacity-30', 'cursor-not-allowed');
        tabHistory.classList.remove('hover:text-slate-200');
        tabHistory.setAttribute('title', 'ไม่สามารถตรวจสอบประวัติย้อนหลังได้ในโหมดไม่ระบุตัวตน');
    } else {
        document.getElementById('user-display-points').parentElement.classList.remove('opacity-40');

        // Enable My History tab button
        tabHistory.disabled = false;
        tabHistory.classList.remove('opacity-30', 'cursor-not-allowed');
        tabHistory.classList.add('hover:text-slate-200');
        tabHistory.removeAttribute('title');
    }

    // Load History View
    renderHistory();
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2);
}

function showScreen(screenId) {
    document.getElementById('screen-login').classList.add('hidden');
    document.getElementById('screen-dashboard').classList.add('hidden');
    document.getElementById('screen-success').classList.add('hidden');

    document.getElementById(`screen-${screenId}`).classList.remove('hidden');
}

function logout() {
    showScreen('login');
    resetForm();
}

// TAB NAVIGATION
function switchTab(tabId) {
    // Guard clause if attempting to switch to history tab while disabled (Anonymous mode)
    if (tabId === 'history' && currentUser.isAnonymous) {
        return;
    }

    // Hide all tab contents
    document.getElementById('content-new-report').classList.add('hidden');
    document.getElementById('content-history').classList.add('hidden');
    document.getElementById('content-leaderboard').classList.add('hidden');

    // Deactivate all tab buttons styles
    document.getElementById('tab-new-report').className = "flex-1 py-3 text-xs font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-all";

    // Maintain disabled styling if isAnonymous when resetting class list
    if (currentUser.isAnonymous) {
        document.getElementById('tab-history').className = "flex-1 py-3 text-xs font-semibold border-b-2 border-transparent text-slate-400 opacity-30 cursor-not-allowed transition-all";
    } else {
        document.getElementById('tab-history').className = "flex-1 py-3 text-xs font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-all";
    }
    document.getElementById('tab-leaderboard').className = "flex-1 py-3 text-xs font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-all";

    // Show active tab content
    document.getElementById(`content-${tabId}`).classList.remove('hidden');

    // Set active styles to current tab button
    const activeBtn = document.getElementById(`tab-${tabId}`);
    activeBtn.className = "flex-1 py-3 text-xs font-bold border-b-2 border-emerald-500 text-emerald-400 transition-all";
}

// CASCADING DROPDOWN HANDLING (MASTER DATA)
function onSectionChange() {
    const sectionVal = document.getElementById('select-section').value;
    const groupSelect = document.getElementById('select-group');
    const problemSelect = document.getElementById('select-problem');

    // Reset group & problem dropdowns
    groupSelect.innerHTML = '<option value="">-- เลือกกลุ่มปัญหา (Problem Group) --</option>';
    problemSelect.innerHTML = '<option value="">-- กรุณาเลือกกลุ่มปัญหาก่อน --</option>';
    problemSelect.disabled = true;
    problemSelect.classList.add('opacity-50');

    if (sectionVal && masterData[sectionVal]) {
        groupSelect.disabled = false;
        groupSelect.classList.remove('opacity-50');

        const groups = masterData[sectionVal].groups;
        for (const key in groups) {
            const opt = document.createElement('option');
            opt.value = key;
            opt.innerText = groups[key].name;
            groupSelect.appendChild(opt);
        }
    } else {
        groupSelect.disabled = true;
        groupSelect.classList.add('opacity-50');
        groupSelect.innerHTML = '<option value="">-- กรุณาเลือกแผนกก่อน --</option>';
    }

    calculateRealtimeScore();
}

function onGroupChange() {
    const sectionVal = document.getElementById('select-section').value;
    const groupVal = document.getElementById('select-group').value;
    const problemSelect = document.getElementById('select-problem');

    problemSelect.innerHTML = '<option value="">-- เลือกปัญหาที่พบ (Master Problem) --</option>';

    if (sectionVal && groupVal && masterData[sectionVal].groups[groupVal]) {
        problemSelect.disabled = false;
        problemSelect.classList.remove('opacity-50');

        const problems = masterData[sectionVal].groups[groupVal].problems;
        problems.forEach((prob, idx) => {
            const opt = document.createElement('option');
            opt.value = idx;
            opt.innerText = prob;
            problemSelect.appendChild(opt);
        });
    } else {
        problemSelect.disabled = true;
        problemSelect.classList.add('opacity-50');
        problemSelect.innerHTML = '<option value="">-- กรุณาเลือกกลุ่มปัญหาก่อน --</option>';
    }

    calculateRealtimeScore();
}

function onProblemChange() {
    const problemVal = document.getElementById('select-problem').value;
    isMasterProblemSelected = (problemVal !== "");

    // Advance step badge indicator to Step 2
    const badge2 = document.getElementById('step-badge-2');
    if (isMasterProblemSelected) {
        badge2.classList.remove('bg-slate-800', 'text-slate-400');
        badge2.classList.add('bg-emerald-500', 'text-slate-950');
    } else {
        badge2.classList.add('bg-slate-800', 'text-slate-400');
        badge2.classList.remove('bg-emerald-500', 'text-slate-950');
    }

    calculateRealtimeScore();
}

// ATTACH MEDIA SIMULATION
function simulateCameraAttachment() {
    // Simulated base64 image representing a machine error
    attachedImageBase64 = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfvTRha4jc_XKm3MG2PTYhapKGiaBLEEEa0FRtfGsLVWRxyIKc7GprsQv1NKji";

    // Toggle Display
    document.getElementById('media-upload-area').classList.add('hidden');

    const previewContainer = document.getElementById('media-preview-container');
    previewContainer.classList.remove('hidden');

    const previewImg = document.getElementById('media-preview-img');
    previewImg.src = attachedImageBase64;

    calculateRealtimeScore();
}

function removeMedia(event) {
    event.stopPropagation(); // Prevents click triggering file upload area toggle
    attachedImageBase64 = null;

    document.getElementById('media-upload-area').classList.remove('hidden');
    document.getElementById('media-preview-container').classList.add('hidden');
    document.getElementById('media-preview-img').src = "";

    calculateRealtimeScore();
}

// REAL-TIME GAMIFICATION CALCULATOR
function calculateRealtimeScore() {
    let total = 0;

    // 1. Check Master Dropdowns Selected
    const section = document.getElementById('select-section').value;
    const group = document.getElementById('select-group').value;
    const problem = document.getElementById('select-problem').value;

    const isMasterOk = (section !== "" && group !== "" && problem !== "");
    if (isMasterOk) {
        total += 2;
        document.getElementById('score-master').innerText = "+2 แต้ม";
        document.getElementById('score-master').classList.add('text-emerald-400');
    } else {
        document.getElementById('score-master').innerText = "+0 แต้ม";
    }

    // 2. Media Uploaded check
    if (attachedImageBase64) {
        total += 3;
        document.getElementById('score-media').innerText = "+3 แต้ม";
        document.getElementById('criteria-media-icon').className = "fa-solid fa-circle-check text-emerald-500 mr-1.5";
        document.getElementById('criteria-media-text').classList.add('text-slate-200');
        document.getElementById('criteria-media-text').classList.remove('text-slate-400');
    } else {
        document.getElementById('score-media').innerText = "+0 แต้ม";
        document.getElementById('criteria-media-icon').className = "fa-solid fa-circle text-slate-700 mr-1.5";
        document.getElementById('criteria-media-text').classList.remove('text-slate-200');
        document.getElementById('criteria-media-text').classList.add('text-slate-400');
    }

    // 3. Detail > 10 chars check
    const detailText = document.getElementById('input-detail').value;
    if (detailText.trim().length >= 10) {
        total += 2;
        document.getElementById('score-desc').innerText = "+2 แต้ม";
        document.getElementById('criteria-desc-icon').className = "fa-solid fa-circle-check text-emerald-500 mr-1.5";
        document.getElementById('criteria-desc-text').classList.add('text-slate-200');
        document.getElementById('criteria-desc-text').classList.remove('text-slate-400');
    } else {
        document.getElementById('score-desc').innerText = "+0 แต้ม";
        document.getElementById('criteria-desc-icon').className = "fa-solid fa-circle text-slate-700 mr-1.5";
        document.getElementById('criteria-desc-text').classList.remove('text-slate-200');
        document.getElementById('criteria-desc-text').classList.add('text-slate-400');
    }

    // Override score view if Anonymous
    if (currentUser.isAnonymous) {
        document.getElementById('total-predicted-score').innerText = "0 แต้ม (ไม่ระบุตัวตน)";
        document.getElementById('total-predicted-score').className = "bg-amber-500/10 text-amber-500 border border-amber-500/30 py-1 px-3 rounded-full font-bold text-[11px] shadow-lg shadow-emerald-500/0";
    } else {
        document.getElementById('total-predicted-score').innerText = `+${total} แต้ม`;
        document.getElementById('total-predicted-score').className = "bg-emerald-500 text-slate-950 py-1 px-3 rounded-full font-bold text-sm font-numeric shadow-lg shadow-emerald-500/20";
    }

    return total;
}

// SUBMIT REPORT ACTION
function submitReport() {
    const section = document.getElementById('select-section').value;
    const group = document.getElementById('select-group').value;
    const problem = document.getElementById('select-problem').value;
    const detail = document.getElementById('input-detail').value;

    if (section === "" || group === "" || problem === "") {
        alert("❌ กรุณาเลือกข้อมูลแผนก กลุ่มปัญหา และปัญหาจากระบบให้ครบถ้วน!");
        return;
    }

    const earnedPoints = currentUser.isAnonymous ? 0 : calculateRealtimeScore();

    // Build the new item & append to database
    const problemTextName = masterData[section].groups[group].problems[problem];
    const groupTextName = masterData[section].groups[group].name;
    const sectionTextName = masterData[section].name;

    currentGeneratedTicketId = `PMC-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newReport = {
        id: currentGeneratedTicketId,
        section: sectionTextName,
        group: groupTextName,
        problem: problemTextName,
        detail: detail,
        image: attachedImageBase64 ? 'machine_error_04.jpg' : null,
        status: 'Pending',
        statusText: 'รอส่วนกลางรับเรื่อง',
        pointsEarned: earnedPoints,
        date: 'วันนี้ | ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    };

    reportHistory.unshift(newReport); // Add to beginning

    // Update Success view UI
    document.getElementById('display-ticket-id').innerText = currentGeneratedTicketId;
    document.getElementById('display-earned-points').innerText = currentUser.isAnonymous ? "0 แต้ม" : `+${earnedPoints}`;

    if (currentUser.isAnonymous) {
        document.getElementById('anonymous-point-warning').innerText = "เนื่องจากคุณแจ้งปัญหาแบบไม่ระบุตัวตน แต้มสะสมจึงไม่ถูกเพิ่มในบัญชีของคุณ";
        document.getElementById('anonymous-point-warning').className = "text-[10px] text-amber-500 mt-2";
    } else {
        currentUser.points += earnedPoints;
        document.getElementById('anonymous-point-warning').innerText = "คะแนนคาดการณ์จะถูกตรวจสอบความถูกต้องอีกครั้งโดยผู้ตรวจสอบระบบส่วนกลาง";
        document.getElementById('anonymous-point-warning').className = "text-[10px] text-slate-500 mt-2";
    }

    showScreen('success');
}

function backToDashboardAfterSubmit() {
    resetForm();
    setupDashboard();

    // If Anonymous, history is disabled, so we return to 'new-report' instead
    if (currentUser.isAnonymous) {
        switchTab('new-report');
    } else {
        switchTab('history'); // Directly view the newly created issue
    }
    showScreen('dashboard');
}

function resetForm() {
    document.getElementById('select-section').value = "";
    onSectionChange();
    document.getElementById('input-detail').value = "";
    attachedImageBase64 = null;
    document.getElementById('media-upload-area').classList.remove('hidden');
    document.getElementById('media-preview-container').classList.add('hidden');
    document.getElementById('media-preview-img').src = "";

    // Always set back default tab
    switchTab('new-report');

    calculateRealtimeScore();
}

// RENDER HISTORY CARDS
function renderHistory() {
    const listContainer = document.getElementById('history-list');
    listContainer.innerHTML = "";

    if (reportHistory.length === 0) {
        listContainer.innerHTML = '<div class="text-center py-8 text-slate-600"><i class="fa-solid fa-folder-open text-4xl block mb-2"></i> ไม่พบประวัติการแจ้งปัญหา</div>';
        return;
    }

    reportHistory.forEach(item => {
        const card = document.createElement('div');
        card.className = "bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3";

        let statusBadgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
        let statusDot = "bg-amber-400 animate-pulse";

        if (item.status === 'Accepted') {
            statusBadgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            statusDot = "bg-emerald-500";
        } else if (item.status === 'In Progress') {
            statusBadgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
            statusDot = "bg-blue-400 animate-pulse";
        } else if (item.status === 'Rejected') {
            statusBadgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
            statusDot = "bg-rose-500";
        }

        card.innerHTML = `
                    <div class="flex justify-between items-start">
                        <span class="text-[10px] font-bold uppercase text-slate-500 font-numeric">${item.id}</span>
                        <span class="text-[10px] bg-slate-950 py-0.5 px-2 rounded border border-slate-800 text-slate-400">${item.date}</span>
                    </div>

                    <div>
                        <h4 class="text-xs text-slate-400 mb-0.5">${item.section} &gt; ${item.group}</h4>
                        <h3 class="text-sm font-bold text-slate-200">${item.problem}</h3>
                        ${item.detail ? `<p class="text-xs text-slate-400 mt-1 line-clamp-2">${item.detail}</p>` : ''}
                    </div>

                    ${item.image ? `
                    <div class="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                        <i class="fa-solid fa-paperclip text-slate-600 text-xs"></i>
                        <span class="text-[10px] text-slate-400 truncate">มีหลักฐานรูปถ่ายแนบไปแล้ว</span>
                    </div>
                    ` : ''}

                    <div class="flex justify-between items-center pt-2 border-t border-slate-800/60">
                        <div class="flex items-center gap-1.5 py-0.5 px-2.5 rounded-full border text-[10px] font-bold ${statusBadgeColor}">
                            <span class="w-1.5 h-1.5 rounded-full ${statusDot}"></span>
                            ${item.statusText}
                        </div>

                        <div class="flex items-center gap-1.5">
                            <i class="fa-solid fa-award text-amber-400 text-xs"></i>
                            <span class="font-numeric text-xs font-bold text-amber-400">+${item.pointsEarned} แต้ม</span>
                        </div>
                    </div>
                `;

        listContainer.appendChild(card);
    });
}