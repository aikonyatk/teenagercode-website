document.addEventListener('DOMContentLoaded', () => {

    // --- КОНФИГУРАЦИЯ (ВАША ССЫЛКА ИЗ GOOGLE APPS SCRIPT) ---
    // Эту ссылку мы получили после развертывания скрипта в Google Таблице.
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxo4aukjA6-gAvrNShLh7sYINB6A0p-igLgQyanuuMYvsx3Z_ykq8XVGqbWsZrBpb4kzw/exec'; 
    // --------------------------------------------------------

    
    // --- 1. ЛОГИКА МОДАЛЬНОГО ОКНА И КНОПОК CTA ---
    const modal = document.getElementById('registrationModal');
    const ctaButtons = document.querySelectorAll('.cta-button, .nav-cta');
    const closeButton = document.querySelector('.close-button');
    const registrationForm = document.getElementById('registrationForm');

    // Функция для перевода ALERT об успешной регистрации
    function showSuccessAlert(lang) {
        const messages = {
            'ru': 'Отлично! Мы получили вашу заявку и свяжемся с вами в ближайшее время. 📞',
            'kk': 'Керемет! Сіздің өтінішіңізді қабылдадық және жақын арада сізбен хабарласамыз. 📞',
            'en': 'Great! We received your application and will contact you shortly. 📞'
        };
        alert(messages[lang] || messages['ru']); 
    }

    // Открытие модального окна по клику
    ctaButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); 
            if (modal) {
                modal.style.display = 'flex';
                
                // Логика анимации пульсации (ripple)
                const ripple = document.createElement('div');
                ripple.style.position = 'absolute';
                ripple.style.borderRadius = '50%';
                ripple.style.background = 'rgba(255, 255, 255, 0.6)';
                ripple.style.width = '20px';
                ripple.style.height = '20px';
                ripple.style.pointerEvents = 'none';
                ripple.style.animation = 'ripple 0.6s ease-out'; 

                const rect = button.getBoundingClientRect();
                ripple.style.left = (e.clientX - rect.left - 10) + 'px';
                ripple.style.top = (e.clientY - rect.top - 10) + 'px';

                button.style.position = 'relative';
                button.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            }
        });
    });

    // Функция закрытия модального окна (по крестику)
    if (closeButton && modal) {
        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Закрытие при клике вне окна
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // --- ИСПРАВЛЕННАЯ ЛОГИКА ОБРАБОТКИ ОТПРАВКИ ФОРМЫ (URL-encoded) ---
    if (registrationForm && modal) {
        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            const lang = document.documentElement.lang || 'ru'; 
            const userName = document.getElementById('userName').value;
            const userPhone = document.getElementById('userPhone').value;
            
            // 1. Собираем данные в JavaScript Map
            const dataMap = {
                userName: userName,
                userPhone: userPhone,
                lang: lang
            };

            // 2. Преобразуем Map в URL-параметры (ключ1=значение1&ключ2=значение2...)
            const formBody = Object.keys(dataMap).map(key => 
                encodeURIComponent(key) + '=' + encodeURIComponent(dataMap[key])
            ).join('&');
            
            try {
                // 3. Отправляем данные как обычную форму!
                const response = await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    // Обязательно меняем заголовок на url-encoded
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, 
                    body: formBody // Отправляем строку параметров
                });
                
                // 4. Получаем и проверяем ответ от Google (Apps Script пришлет JSON)
                const result = await response.json();
                
                if (result.result === 'success') {
                    showSuccessAlert(lang); 
                } else {
                    console.error("Ошибка при сохранении в Таблицу:", result.message);
                    alert(`Не удалось отправить заявку. Ошибка: ${result.message}`);
                }
                
            } catch (error) {
                console.error("Ошибка сети или сервера:", error);
                alert("Не удалось отправить заявку. Пожалуйста, проверьте ваше подключение.");
            }
            
            // 5. Скрываем модальное окно и очищаем поля
            modal.style.display = 'none';
            registrationForm.reset();
        });
    }
    // ----------------------------------------------------


    // --- 2. ЛОГИКА АНИМАЦИИ ПЛАВНОГО ПОЯВЛЕНИЯ КАРТОЧЕК (Intersection Observer) ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const cards = document.querySelectorAll('.benefit-card, .skill-card, .feature, .format-card, .testimonial-card');
    cards.forEach((card) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease`; 
        observer.observe(card);
    });
    // ----------------------------------------------------
});
