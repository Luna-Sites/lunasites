# Color Schema Hierarchy System - Instalare și Utilizare

Un sistem complet de culori cu moștenire ierarhică pentru Luna Sites, similar cu cum funcționează volto-footer.

## 🚀 Instalare

### 1. Backend Setup
```bash
cd backend
make restart
```

### 2. Frontend Setup  
```bash
cd frontend
yarn start
```

## 🎨 Cum Funcționează

### Moștenire Ierarhică
Similar cu `volto-footer`, sistemul de color schema funcționează cu moștenirea ierarhică:

1. **Nivel Site** - Culorile default ale site-ului (în registry)
2. **Nivel Folder** - Folder-urile pot avea propria schemă de culori
3. **Nivel Pagină** - Paginile individuale pot suprascrie culorile

### Pattern de Moștenire
```
Site (registry) 
  └── Folder A (poate avea culori proprii)
      ├── Pagina 1 (moștenește de la Folder A)
      └── Pagina 2 (poate avea culori proprii, suprascrie Folder A)
  └── Folder B (moștenește de la Site)
      └── Pagina 3 (moștenește de la Site prin Folder B)
```

## 📝 Utilizare

### Pentru Editori de Conținut

#### 1. Accesarea Field-ului Color Schema
- Editează orice pagină (Document, Folder, News Item, Event)
- În sidebar-ul din dreapta, caută secțiunea **"Color Schema"**
- Interface-ul este direct în sidebar, fără modal

#### 2. Setarea Culorilor
- **Preview Bar**: Vezi culorile aplicate în timp real
- **Quick Presets**: Dropdown cu scheme predefinite
- **Customize Colors**: 6 color pickers pentru fiecare culoare
  - Background, Primary, Secondary, Header, Text, Accent
- **Aplicare Imediată**: Culorile se aplică automat la schimbare

#### 3. Opțiuni de Moștenire
- **"Clear All & Use Inherited"**: Șterge toate culorile și moștenește
- **Indicator "Using inherited colors"**: Când se folosesc culori moștenite
- **Active Colors**: Lista culorilor active la sfârșitul widget-ului

### Pentru Dezvoltatori

#### 1. Folosirea CSS Variables

Toate culorile sunt disponibile automat ca CSS custom properties:

```css
.my-component {
  background-color: var(--lunasites-background-color);
  color: var(--lunasites-text-color);
  border: 1px solid var(--lunasites-primary-color);
}

/* Variante auto-generate */
.button {
  background-color: var(--lunasites-primary-color);
}

.button:hover {
  background-color: var(--lunasites-primary-dark);
}
```

#### 2. Utility Classes

```html
<div class="color-schema-primary-bg">
  <h1 class="color-schema-text">Title</h1>
  <p class="color-schema-transition">Content with smooth transitions</p>
</div>
```

#### 3. JavaScript Access

```javascript
// Ascultă pentru schimbări de culori
window.addEventListener('colorSchemaApplied', (event) => {
  console.log('New color schema:', event.detail.schema);
});

// Obține culorile curente
const rootStyle = getComputedStyle(document.documentElement);
const primaryColor = rootStyle.getPropertyValue('--lunasites-primary-color');
```

## 🔧 API-uri Disponibile

### 1. Moștenire Color Schema
```bash
GET /@inherit?expand.inherit.behaviors=lunasites.behaviors.color_schema.IColorSchemaBehavior
```
Returnează:
```json
{
  "lunasites.behaviors.color_schema.IColorSchemaBehavior": {
    "data": {
      "color_schema": {
        "background_color": "#ffffff",
        "primary_color": "#0070ae"
      }
    }
  }
}
```

### 2. Management Global
```bash
GET /@color-schema        # Obține schema globală și presets
POST /@color-schema       # Actualizează schema globală
PUT /@color-schema        # Aplică un preset
```

## 🎯 Funcționalități Cheie

### ✅ Moștenire Automată
- Culorile se moștenesc automat în ierarhie
- Indicator vizual pentru sursă ("Inherited from: Site Default")
- Posibilitatea de override la orice nivel

### ✅ Field în Sidebar
- Disponibil pentru toate tipurile de conținut
- Integrat în interfața standard Plone
- Preview în timp real

### ✅ CSS Variables Automate
- Injectare automată în `document.documentElement`
- Variante light/dark auto-generate
- Event-uri pentru notificări

### ✅ Presets și Sugestii
- 5 presets predefinite
- Sugestii inteligente bazate pe teoria culorilor
- Posibilitatea de aplicare rapidă

## 🧪 Testare

### 1. Test Manual
1. Editează site-ul root și setează o schemă de culori globală
2. Creează un folder și setează culori diferite
3. Creează o pagină în folder - verifică moștenirea
4. Setează culori diferite pentru pagină - verifică override-ul
5. Verifică că culorile se aplică automat în interfață

### 2. Test cu ColorTestDemo
Pentru a vedea culorile în acțiune, poți folosi componenta de test:
```javascript
import { ColorTestDemo } from 'volto-lunasites/components';

// Folosește în orice pagină pentru a vedea culorile aplicate
<ColorTestDemo />
```

### 2. Test CSS Variables
```javascript
// În console browser
console.log(getComputedStyle(document.documentElement).getPropertyValue('--lunasites-primary-color'));
```

### 3. Test API
```bash
curl "http://localhost:8080/Plone/folder-a/@inherit?expand.inherit.behaviors=lunasites.behaviors.color_schema.IColorSchemaBehavior"
```

## 📋 Behavior și Tipuri de Conținut

### Tipuri Suportate
- ✅ Document
- ✅ Folder  
- ✅ News Item
- ✅ Event

### Comportament Behavior
- Se adaugă automat la tipurile configurate
- Field optional (nu obligatoriu)
- Serialized ca JSON în obiectul Plone

## 🔍 Troubleshooting

### Culorile Nu Se Aplică
1. Verifică că behavior-ul este activ pe tipul de conținut
2. Verifică console-ul browser pentru erori JavaScript
3. Reîncarcă pagina după modificări

### Moștenirea Nu Funcționează
1. Verifică API-ul `/@inherit?expand.inherit.behaviors=lunasites.behaviors.color_schema.IColorSchemaBehavior`
2. Asigură-te că există un părinte cu culori setate
3. Verifică configurația reducer-ului în Redux

### Probleme de Performance
1. CSS variables sunt native - foarte rapide
2. API calls sunt cacheable
3. Events sunt optimizate pentru re-render minim

## 🎉 Rezultat Final

✅ **Color Schema ca Field**: Disponibil în sidebar pentru toate paginile
✅ **Moștenire Ierarhică**: Exact ca volto-footer
✅ **CSS Variables Automate**: Injectare transparentă
✅ **Presets și Sugestii**: Experiență Squarespace-like
✅ **API Complet**: Backend robust cu inheritance logic

Sistemul este complet funcțional și oferă o experiență similară cu Squarespace pentru managementul culorilor! 🚀