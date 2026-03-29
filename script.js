const API_URL = 'http://localhost:5000/api/leads';

// --- 1. TAB NAVIGATION LOGIC ---
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.content-section');
const pageTitle = document.getElementById('page-title');
const addBtn = document.getElementById('add-btn');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');

        // Update Active Class on Nav
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        // Show/Hide Sections
        sections.forEach(section => {
            section.style.display = (section.id === target) ? 'block' : 'none';
        });

        // Update Header
        pageTitle.innerText = item.innerText;
        addBtn.style.display = (target === 'dashboard') ? 'block' : 'none';

        // Trigger Analytics refresh if needed
        if (target === 'analytics') calculateAnalytics();
    });
});

// --- 2. BACKEND API FUNCTIONS ---
async function fetchLeads() {
    try {
        const res = await fetch(API_URL);
        const leads = await res.json();
        const tbody = document.getElementById('leads-body');
        tbody.innerHTML = '';

        leads.forEach(lead => {
            tbody.innerHTML += `
                <tr>
                    <td><strong>${lead.name}</strong></td>
                    <td>${lead.email}</td>
                    <td>
                        <select onchange="updateStatus('${lead._id}', this.value)">
                            <option value="New" ${lead.status === 'New' ? 'selected' : ''}>New</option>
                            <option value="Contacted" ${lead.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
                            <option value="Converted" ${lead.status === 'Converted' ? 'selected' : ''}>Converted</option>
                        </select>
                    </td>
                    <td><button onclick="deleteLead('${lead._id}')" class="text-btn">Delete</button></td>
                </tr>`;
        });
        updateStats(leads);
    } catch (e) {
        console.error("Backend server not reached. Is node server.js running?");
    }
}

async function updateStatus(id, status) {
    await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({status})
    });
    fetchLeads();
}

async function deleteLead(id) {
    if(confirm("Permanently delete this lead?")) {
        await fetch(`${API_URL}/${id}`, {method: 'DELETE'});
        fetchLeads();
    }
}

document.getElementById('lead-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const lead = {
        name: document.getElementById('clientName').value,
        email: document.getElementById('clientEmail').value,
        status: document.getElementById('clientStatus').value
    };
    await fetch(API_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(lead)
    });
    toggleModal(false);
    e.target.reset();
    fetchLeads();
});

// --- 3. UTILITY FUNCTIONS ---
function updateStats(leads) {
    document.getElementById('total-count').innerText = leads.length;
    document.getElementById('progress-count').innerText = leads.filter(l => l.status === 'Contacted').length;
    document.getElementById('converted-count').innerText = leads.filter(l => l.status === 'Converted').length;
}

async function calculateAnalytics() {
    const res = await fetch(API_URL);
    const leads = await res.json();
    const converted = leads.filter(l => l.status === 'Converted').length;
    const rate = leads.length ? Math.round((converted / leads.length) * 100) : 0;
    document.getElementById('conv-rate').innerText = rate + '%';
}

function toggleModal(show) {
    document.getElementById('leadModal').style.display = show ? 'flex' : 'none';
}

// Initial Load
window.onload = fetchLeads;