document.addEventListener('DOMContentLoaded', function() {
  const cityInput = document.getElementById('city');
  const form = document.getElementById('introForm');
  const submitButton = document.getElementById('submitBtn');
  const nameInput = document.getElementById('name');
  
  // Verificar se o navegador suporta geolocalização
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      // Utilizar serviço de geocodificação reversa para obter a cidade
      const geocodeUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`;
      
      fetch(geocodeUrl)
        .then(response => response.json())
        .then(data => {
          const city = data.locality;
          cityInput.value = city;
          cityInput.removeAttribute('disabled');
          submitButton.removeAttribute('disabled');
          form.querySelector('label[for="city"]').textContent = '';
        })
        .catch(error => {
          console.error('Erro ao obter a cidade:', error);
          cityInput.placeholder = 'Erro ao carregar cidade. Preencha manualmente.';
          cityInput.removeAttribute('disabled');
          submitButton.removeAttribute('disabled');
        });
    }, error => {
      console.error('Erro ao obter a localização:', error);
      cityInput.placeholder = 'Erro ao carregar cidade. Preencha manualmente.';
      cityInput.removeAttribute('disabled');
      submitButton.removeAttribute('disabled');
    });
  } else {
    console.error('Geolocalização não é suportada pelo navegador.');
    cityInput.placeholder = 'Geolocalização não suportada. Preencha manualmente.';
    cityInput.removeAttribute('disabled');
    submitButton.removeAttribute('disabled');
  }

  // Validação de comprimento do nome de usuário
  nameInput.addEventListener('input', function() {
    if (nameInput.value.length > 20) {
      nameInput.value = nameInput.value.substring(0, 20);
    }
  });

  // Ao clicar no botão fora do formulário
  submitButton.addEventListener('click', function(e) {
    e.preventDefault(); // Evita que o botão faça o comportamento padrão de enviar o formulário

    const name = nameInput.value;
    const city = cityInput.value;
    
    // Armazenar os dados temporariamente no localStorage
    localStorage.setItem('username', name);
    localStorage.setItem('usercity', city);
    
    // Redirecionar para a página principal do chat
    var audio = document.querySelector("audio");
    audio.play();
    document.body.classList.add("blur");
    
    setTimeout(function () {
      window.location.href = "chat.html";
    }, 1300);
  });
});
