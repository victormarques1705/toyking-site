// ===== SUPABASE CONFIG =====
const SUPABASE_URL = 'https://aodceykshdczxfcmdwoz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KFc0dyzwF0UVIBvw88tl4w_LbZpzNUL';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== SUPABASE HELPER FUNCTIONS =====

// --- PRODUCTS ---
async function sbGetProducts() {
    const { data, error } = await supabaseClient.from('products').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Erro ao buscar produtos:', error); return []; }
    return data || [];
}

async function sbUpsertProduct(product) {
    const { data, error } = await supabaseClient.from('products').upsert(product, { onConflict: 'product_code' }).select();
    if (error) { console.error('Erro ao salvar produto:', error); return null; }
    return data ? data[0] : null;
}

async function sbDeleteProduct(id) {
    const { error } = await supabaseClient.from('products').delete().eq('id', id);
    if (error) console.error('Erro ao excluir produto:', error);
    return !error;
}

// --- BANNERS ---
async function sbGetBanners() {
    const { data, error } = await supabaseClient.from('banners').select('*').order('sort_order', { ascending: true });
    if (error) { console.error('Erro ao buscar banners:', error); return []; }
    return data || [];
}

async function sbUpsertBanner(banner) {
    const { data, error } = await supabaseClient.from('banners').upsert(banner).select();
    if (error) { console.error('Erro ao salvar banner:', error); return null; }
    return data ? data[0] : null;
}

async function sbDeleteBanner(id) {
    const { error } = await supabaseClient.from('banners').delete().eq('id', id);
    if (error) console.error('Erro ao excluir banner:', error);
    return !error;
}

// --- CATEGORIES ---
async function sbGetCategories() {
    const { data, error } = await supabaseClient.from('categories').select('*').order('sort_order', { ascending: true });
    if (error) { console.error('Erro ao buscar categorias:', error); return []; }
    return data || [];
}

async function sbUpsertCategory(category) {
    const { data, error } = await supabaseClient.from('categories').upsert(category).select();
    if (error) { console.error('Erro ao salvar categoria:', error); return null; }
    return data ? data[0] : null;
}

async function sbDeleteCategory(id) {
    const { error } = await supabaseClient.from('categories').delete().eq('id', id);
    if (error) console.error('Erro ao excluir categoria:', error);
    return !error;
}

// --- MANUALS ---
async function sbGetManuals() {
    const { data, error } = await supabaseClient.from('manuals').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Erro ao buscar manuais:', error); return []; }
    return data || [];
}

async function sbUpsertManual(manual) {
    const { data, error } = await supabaseClient.from('manuals').upsert(manual).select();
    if (error) { console.error('Erro ao salvar manual:', error); return null; }
    return data ? data[0] : null;
}

async function sbDeleteManual(id) {
    const { error } = await supabaseClient.from('manuals').delete().eq('id', id);
    if (error) console.error('Erro ao excluir manual:', error);
    return !error;
}

// --- SETTINGS ---
async function sbGetSettings() {
    const { data, error } = await supabaseClient.from('settings').select('*');
    if (error) { console.error('Erro ao buscar configurações:', error); return []; }
    return data || [];
}

async function sbUpsertSetting(key, value) {
    const { data, error } = await supabaseClient.from('settings').upsert({ key, value }, { onConflict: 'key' }).select();
    if (error) { console.error('Erro ao salvar configuração:', error); return null; }
    return data ? data[0] : null;
}

// --- STORAGE (Image Upload) ---
async function sbUploadImage(bucket, filePath, file) {
    const { data, error } = await supabaseClient.storage.from(bucket).upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
    });
    if (error) { console.error('Erro ao fazer upload:', error); return null; }
    const { data: urlData } = supabaseClient.storage.from(bucket).getPublicUrl(filePath);
    return urlData.publicUrl;
}
