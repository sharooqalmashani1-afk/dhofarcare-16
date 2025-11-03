
// Hydrate UI from config
(function(){
  const C = window.DHOFARCARE_CONFIG || {};
  document.querySelectorAll('.phone').forEach(n=>n.textContent=C.WHATSAPP||C.PHONE_E164||'');
  document.querySelectorAll('.email').forEach(n=>n.textContent=C.EMAIL||'');
  document.querySelectorAll('.area').forEach(n=>n.textContent=C.SERVICE_AREA||'');
  document.querySelectorAll('.hours').forEach(n=>n.textContent=C.HOURS||'');
  document.querySelectorAll('.address').forEach(n=>n.textContent=C.ADDRESS||'');
  document.querySelectorAll('.phoneLink').forEach(a=>{ a.href=`https://wa.me/${(C.WHATSAPP||'').replace(/\D/g,'')}`; });
  document.querySelectorAll('.emailLink').forEach(a=>{ a.href=`mailto:${C.EMAIL}`; });
  document.getElementById('year').textContent = new Date().getFullYear();
  document.documentElement.style.setProperty('--primary', C.PRIMARY_COLOR||'#0A66C2');
  document.documentElement.style.setProperty('--accent', C.ACCENT_COLOR||'#4DA3FF');
})();

// Date default/min = today
const dateInput = document.getElementById('date');
if (dateInput){
  const today = new Date(); today.setHours(0,0,0,0);
  const iso = today.toISOString().slice(0,10);
  dateInput.min = iso;
  dateInput.value = iso; // اختيار تلقائي لليوم
}

const bookingForm = document.getElementById('bookingForm');
const paymentPanel = document.getElementById('paymentPanel');
const paymentForm = document.getElementById('paymentForm');
const successPanel = document.getElementById('successPanel');
const backToBooking = document.getElementById('backToBooking');
const newBooking = document.getElementById('newBooking');

function luhnValid(num){
  const s = num.replace(/\D/g,'');
  let sum = 0, dbl=false;
  for(let i=s.length-1;i>=0;i--){
    let d = parseInt(s[i],10);
    if(dbl){ d*=2; if(d>9) d-=9; }
    sum+=d; dbl=!dbl;
  }
  return (sum % 10)===0 && s.length>=13;
}

bookingForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(bookingForm).entries());
  // Require wilayah in Dhofar (already enforced by select), just store booking
  localStorage.setItem('dhofarcare_booking', JSON.stringify(data));
  bookingForm.classList.add('hidden');
  paymentPanel.classList.remove('hidden');
  window.scrollTo({top: paymentPanel.offsetTop - 60, behavior: 'smooth'});
});

backToBooking?.addEventListener('click', ()=>{
  paymentPanel.classList.add('hidden');
  bookingForm.classList.remove('hidden');
});

paymentForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const card = paymentForm.cardnumber.value.trim();
  const exp = paymentForm.exp.value.trim();
  const cvc = paymentForm.cvc.value.trim();
  if(!luhnValid(card)){ alert('الرجاء إدخال رقم بطاقة تجريبي صحيح (مثال 4242 4242 4242 4242).'); return; }
  if(!/^\d{2}\/(\d{2})$/.test(exp)){ alert('صيغة الانتهاء MM/YY.'); return; }
  if(!/^\d{3,4}$/.test(cvc)){ alert('أدخل CVC من 3–4 أرقام.'); return; }

  const booking = JSON.parse(localStorage.getItem('dhofarcare_booking')||'{}');
  // إذا أردت وقتًا تلقائيًا: الساعة 10 صباحًا
  booking.autotime = '10:00';
  localStorage.setItem('dhofarcare_lastSuccess', JSON.stringify({when: Date.now(), booking}));
  paymentPanel.classList.add('hidden');
  successPanel.classList.remove('hidden');
  window.scrollTo({top: successPanel.offsetTop - 60, behavior: 'smooth'});
  bookingForm.reset();
  paymentForm.reset();
});

paymentForm?.cardnumber?.addEventListener('input', (e)=>{
  let v = e.target.value.replace(/\D/g,'').slice(0,16);
  e.target.value = v.replace(/(\d{4})(?=\d)/g, '$1 ');
});
