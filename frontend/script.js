// Submit vote via Socket.IO
function submitVote(candidate) {
    const socket = io();
    socket.emit('vote', candidate);
    alert('Vote submitted!');
  }
  
  // Real-time results listener
  const socket = io();
  socket.on('results', (data) => {
    document.getElementById('resultsContainer').innerHTML = `
      <div class="alert alert-info">${data.candidateA} votes for Candidate A</div>
      <div class="alert alert-info">${data.candidateB} votes for Candidate B</div>
    `;
  });

  // After a successful login (inside your login form's submit handler)
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Login logic (existing code)
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    })
  });

  if (response.ok) {
    // Login successful, now send OTP
    try {
      await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: document.getElementById('email').value })
      });
      alert('OTP sent to your email!');
      
      // Redirect to OTP verification page or show OTP input field
      window.location.href = '/verify-otp'; // Example
    } catch (err) {
      console.error('Failed to send OTP:', err);
    }
  } else {
    alert('Login failed. Check your credentials.');
  }
});

function toggleMenu() {
  const navbarNav = document.querySelector('.navbar-nav');
  navbarNav.classList.toggle('show');
}