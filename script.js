// Wizard navigation
const steps = Array.from(document.querySelectorAll('.step'));
const formSteps = Array.from(document.querySelectorAll('.form-step'));
let current = 0;

function showStep(index){
  steps.forEach((s,i)=> s.classList.toggle('active', i===index));
  formSteps.forEach((fs,i)=> fs.classList.toggle('active', i===index));
  current = index;
  window.scrollTo({top:0,behavior:'smooth'});
}

document.querySelectorAll('.nextBtn').forEach(btn=>{
  btn.addEventListener('click', ()=> showStep(Math.min(current+1, formSteps.length-1)));
});
document.querySelectorAll('.prevBtn').forEach(btn=>{
  btn.addEventListener('click', ()=> showStep(Math.max(current-1, 0)));
});
steps.forEach((s, i)=> s.addEventListener('click', ()=> showStep(i)));

// Products dynamic add/remove
const productsContainer = document.getElementById('productsContainer');
const addProductBtn = document.getElementById('addProductBtn');

function createProductCard(idx){
  const div = document.createElement('div');
  div.className = 'product-card';
  div.innerHTML = `
    <h3>منتج #${idx+1}</h3>
    <label>اسم المنتج (عربي)</label>
    <input name="products[${idx}][name_ar]" type="text">
    <label>اسم المنتج (إنجليزي)</label>
    <input name="products[${idx}][name_en]" type="text">
    <label>وصف قصير</label>
    <textarea name="products[${idx}][short_desc]"></textarea>
    <label>وصف تفصيلي</label>
    <textarea name="products[${idx}][long_desc]"></textarea>
    <label>السعر الوحدة</label>
    <input name="products[${idx}][price]" type="number" step="0.01">
    <label>سعر الجملة (اختياري)</label>
    <input name="products[${idx}][wholesale_price]" type="number" step="0.01">
    <label>الكمية المتاحة</label>
    <input name="products[${idx}][stock]" type="number">
    <label>الوزن / الحجم</label>
    <input name="products[${idx}][size]" type="text">
    <label>بلد المنشأ</label>
    <input name="products[${idx}][origin]" type="text">
    <label>SKU / باركود</label>
    <input name="products[${idx}][sku]" type="text">
    <label>روابط صور (أفضل رفع على Google Drive أو Imgur)</label>
    <input name="products[${idx}][images]" type="text" placeholder="رابط 1, رابط 2">
    <div class="product-controls">
      <button type="button" class="small removeProduct">حذف المنتج</button>
    </div>
  `;
  return div;
}

let productCount = 0;
function addProduct(){
  const card = createProductCard(productCount);
  productsContainer.appendChild(card);
  productCount++;
  // attach remove listener
  card.querySelector('.removeProduct').addEventListener('click', ()=>{
    card.remove();
  });
}

// start with one product
addProduct();

addProductBtn.addEventListener('click', addProduct);

// Form submit: gather all data into object, show JSON in review step, and allow download
const form = document.getElementById('wizardForm');
const reviewBox = document.getElementById('reviewBox');
const downloadJsonBtn = document.getElementById('downloadJson');

function formToObject(){
  const data = {};
  const fd = new FormData(form);
  // simple fields
  for (const [k,v] of fd.entries()){
    // handle products specially (names like products[0][name_ar])
    if(k.startsWith('products[')){
      // parse indices
      const match = k.match(/products\[(\d+)\]\[(.+)\]/);
      if(match){
        const idx = match[1];
        const key = match[2];
        data.products = data.products || [];
        data.products[idx] = data.products[idx] || {};
        data.products[idx][key] = v;
        continue;
      }
    }
    if(data[k] !== undefined){
      // if already exists, convert to array
      if(!Array.isArray(data[k])) data[k] = [data[k]];
      data[k].push(v);
    } else {
      data[k] = v;
    }
  }
  return data;
}

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  // final validation (check required basics)
  const required = ['brand_ar','owner_name','phone','email'];
  for(const r of required){
    if(!form.querySelector(`[name="${r}"]`).value.trim()){
      alert('من فضلك املأ الحقول الأساسية في البيانات الأساسية');
      showStep(0);
      return;
    }
  }
  const data = formToObject();
  reviewBox.textContent = JSON.stringify(data, null, 2);
  // pretend to send: here we just show success and offer download
  alert('تم إرسال النموذج بنجاح - يمكنك تحميل JSON أو ربطه بجوجل شيت');
  // Optionally, automatically download JSON
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'store_form_response.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
});

downloadJsonBtn.addEventListener('click', ()=>{
  const data = formToObject();
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'store_form_response.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
});

// show review when reaching step 7
const observer = new MutationObserver(()=> {
  const activeIndex = formStepsIndex();
  if(activeIndex === formStepsLength()-1){
    const data = formToObject();
    reviewBox.textContent = JSON.stringify(data, null, 2);
  }
});
observer.observe(document.querySelector('#steps'), { attributes: true, childList: true, subtree: true });

function formStepsIndex(){
  const idx = formSteps.findIndex(fs => fs.classList.contains('active'));
  return idx;
}
function formStepsLength(){ return formSteps.length; }

// initial show
showStep(0);
