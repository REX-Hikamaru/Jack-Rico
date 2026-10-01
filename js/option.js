// FAQはdetails要素で動作するため、JavaScriptなしでも閲覧できます。
document.querySelectorAll('.faq-item').forEach(item => {
	item.addEventListener('toggle', () => {
		if (!item.open) return;
		document.querySelectorAll('.faq-item[open]').forEach(other => {
			if (other !== item) other.removeAttribute('open');
		});
	});
});

const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (contactForm && formStatus) {
	contactForm.addEventListener('submit', async event => {
		event.preventDefault();

		const submitButton = contactForm.querySelector('[type="submit"]');
		const formData = new FormData(contactForm);
		if (formData.get('company')) return;

		submitButton.disabled = true;
		formStatus.className = 'form-status';
		formStatus.textContent = '送信中です…';

		try {
			const response = await fetch(contactForm.action, {
				method: 'POST',
				body: formData,
				headers: { Accept: 'application/json' }
			});

			if (!response.ok) throw new Error('送信に失敗しました');
			contactForm.reset();
			formStatus.className = 'form-status is-success';
			formStatus.textContent = '送信が完了しました。お問い合わせありがとうございます。';
		} catch (error) {
			formStatus.className = 'form-status is-error';
			formStatus.textContent = '送信できませんでした。時間をおいて再度お試しください。';
		} finally {
			submitButton.disabled = false;
		}
	});
}
