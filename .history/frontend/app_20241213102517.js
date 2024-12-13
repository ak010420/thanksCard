document.getElementById('submissionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const receiver = document.getElementById('receiver').value;
    const date = document.getElementById('date').value;
    const content = document.getElementById('content').value;

    await fetch('/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'currentUserId', receiver, date, content }),
    });

    alert('送信しました！');
});

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
}
