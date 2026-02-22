document.addEventListener('DOMContentLoaded', function(){
  const form = document.getElementById('announceForm');
  const imagesInput = document.getElementById('imagesInput');
  const imagesPreview = document.getElementById('imagesPreview');
  const success = document.getElementById('announceSuccess');

  // preview de imagens
  imagesInput.addEventListener('change', function(){
    imagesPreview.innerHTML = '';
    const files = Array.from(this.files).slice(0,6);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = function(e){
        const img = document.createElement('img');
        img.src = e.target.result;
        imagesPreview.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    const fd = new FormData(form);
    const ad = {
      id: Date.now(),
      title: fd.get('title') || '',
      category: fd.get('category') || '',
      type: fd.get('type') || '',
      price: fd.get('price') || '',
      city: fd.get('city') || '',
      description: fd.get('description') || '',
      phone: fd.get('phone') || '',
      ownerEmail: (JSON.parse(localStorage.getItem('user')||'null') || {}).email || 'anonimo@example.com',
      date: new Date().toISOString(),
      views: 0,
      imageData: []
    };

    // pega imagens em base64
    const files = Array.from(imagesInput.files).slice(0,6);
    const readers = files.map(f => new Promise((res)=>{
      const r = new FileReader(); r.onload = ()=>res(r.result); r.readAsDataURL(f);
    }));

    Promise.all(readers).then(results=>{
      ad.imageData = results;

      // salvar no localStorage como simulação de backend
      const stored = JSON.parse(localStorage.getItem('pending_ads') || '[]');
      stored.unshift(ad);
      localStorage.setItem('pending_ads', JSON.stringify(stored));

      // mostra sucesso e redireciona para perfil após 1.2s
      success.style.display = 'block';
      setTimeout(()=>{
        window.location.href = 'perfil.html';
      },1200);
    }).catch(err=>{
      console.error('erro ao ler imagens', err);
      alert('Erro ao processar imagens');
    });
  });
});