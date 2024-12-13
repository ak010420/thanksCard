// 投稿フォームの宛名にLINE WORKSユーザー一覧を表示
async function loadUsers() {
    const response = await fetch('/users');
    const users = await response.json();

    const select = document.getElementById('receiver');
    select.innerHTML = ''; // 既存のオプションをクリア

    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name;
        select.appendChild(option);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadUsers();

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
});
