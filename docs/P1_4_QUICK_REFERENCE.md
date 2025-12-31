# P1.4 Quick Reference - Language Dashboard

**Component Map | File Locations | Quick Start**

---

## Component Files

| Component | Location | Purpose | Lines |
|-----------|----------|---------|-------|
| **Main Page** | | | |
| LanguageDetailPage | `src/pages/LanguageDetailPage.tsx` | Main container, data fetching, routing | 105 |
| **Header** | | | |
| LanguageHeader | `src/components/language-detail/LanguageHeader.tsx` | Gradient header with language info | 51 |
| VisibilityBadge | `src/components/language-detail/VisibilityBadge.tsx` | Visibility status badge | 20 |
| **Tabs** | | | |
| LanguageTabs | `src/components/language-detail/LanguageTabs.tsx` | Tab navigation & routing | 50 |
| OverviewTab | `src/components/language-detail/tabs/OverviewTab.tsx` | 4 expandable spec sections | 185 |
| DictionaryTab | `src/components/language-detail/tabs/DictionaryTab.tsx` | Word table with search/filter | 160 |
| RulesTab | `src/components/language-detail/tabs/RulesTab.tsx` | Grammar rule cards with filter | 180 |
| CoursesTab | `src/components/language-detail/tabs/CoursesTab.tsx` | Course cards grid | 155 |
| **Modals** | | | |
| EditLanguageModal | `src/components/language-detail/EditLanguageModal.tsx` | Edit language info | 115 |
| VisibilitySettingsModal | `src/components/language-detail/VisibilitySettingsModal.tsx` | Change visibility settings | 145 |
| **Utilities** | | | |
| LoadingSpinner | `src/components/LoadingSpinner.tsx` | Loading animation | 11 |
| ErrorBoundary | `src/components/ErrorBoundary.tsx` | Error catching | 48 |
| **Updated Files** | | | |
| App.tsx | `src/App.tsx` | Added `/languages/:languageId` route | — |
| progress.md | `progress.md` | Updated P1.4 status | — |

**Total:** 12 components, ~1,400+ LOC

---

## Quick Navigation

### To Add a Word (Placeholder)
Currently shows "Add Word" button. When implementing (P2.2):

```tsx
// In DictionaryTab.tsx, replace:
<button className="px-4 py-2 bg-blue-600 ...">
  + Add Word
</button>

// With:
<button onClick={() => setShowAddWordModal(true)}>
  + Add Word
</button>
```

### To Add a Rule (Placeholder)
Currently shows "Add Rule" button. When implementing (P2.6):

```tsx
// In RulesTab.tsx, replace button with click handler
// Open AddRuleModal component
```

### To Add Course (Placeholder)
Currently shows "Create Course" button. When implementing (P2.9):

```tsx
// In CoursesTab.tsx, replace button with click handler
// Open CreateCourseModal component
```

---

## Data Flow Diagram

```
User navigates to /languages/{languageId}
            ↓
LanguageDetailPage loads
            ↓
[Parallel Fetches]:
├─ languages table → language data
├─ users table → owner info
└─ language_collaborators → user role
            ↓
Role Check (owner/editor/viewer/none)
            ↓
Render UI:
├─ LanguageHeader (always)
├─ LanguageTabs (always)
│  ├─ OverviewTab (always)
│  ├─ DictionaryTab (loads dictionaries from DB)
│  ├─ RulesTab (loads grammar_rules from DB)
│  └─ CoursesTab (loads courses from DB)
├─ EditLanguageModal (if isEditModalOpen)
└─ VisibilitySettingsModal (if isVisibilityModalOpen)
```

---

## Role-Based UI Matrix

| Feature | Owner | Editor | Viewer | None |
|---------|-------|--------|--------|------|
| View Overview | ✓ | ✓ | ✓ | ✗ |
| View Dictionary | ✓ | ✓ | ✓ | ✗ |
| View Rules | ✓ | ✓ | ✓ | ✗ |
| View Courses | ✓ | ✓ | ✓ | ✗ |
| Edit Language | ✓ | ✓ | ✗ | ✗ |
| Change Visibility | ✓ | ✓ | ✗ | ✗ |
| Add Word | ✓ | ✓ | ✗ | ✗ |
| Edit Word | ✓ | ✓ | ✗ | ✗ |
| Delete Word | ✓ | ✓ | ✗ | ✗ |
| Add Rule | ✓ | ✓ | ✗ | ✗ |
| Edit Rule | ✓ | ✓ | ✗ | ✗ |
| Delete Rule | ✓ | ✓ | ✗ | ✗ |
| Create Course | ✓ | ✓ | ✗ | ✗ |
| Enroll Course | ✓ | ✓ | ✓ | ✗ |

---

## State Management Reference

### LanguageDetailPage State
```tsx
const [language, setLanguage] = useState<Language | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [activeTab, setActiveTab] = useState<'overview' | ...>('overview');
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false);
const [owner, setOwner] = useState<...>(null);
const [userRole, setUserRole] = useState<...>('none');
```

### EditLanguageModal State
```tsx
const [formData, setFormData] = useState({
  name: language.name,
  description: language.description || '',
  icon_url: language.icon_url || '🌍',
});
const [saving, setSaving] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### VisibilitySettingsModal State
```tsx
const [visibility, setVisibility] = useState(language.visibility);
const [saving, setSaving] = useState(false);
const [error, setError] = useState<string | null>(null);
```

---

## Common Patterns

### Fetching Data
```tsx
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabaseClient
        .from('tableName')
        .select('*')
        .eq('languageId', language.id);
      
      if (err) throw err;
      setData(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, [dependency]);
```

### Handling User Edits
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    setSaving(true);
    const { data, error: err } = await supabaseClient
      .from('tableName')
      .update({...})
      .eq('id', itemId)
      .select()
      .single();
    
    if (err) throw err;
    onSuccess(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setSaving(false);
  }
};
```

### Role-Based Rendering
```tsx
const canEdit = userRole === 'owner' || userRole === 'editor';

return (
  <>
    {/* Always shown */}
    <button>View</button>
    
    {/* Only for editors */}
    {canEdit && <button>Edit</button>}
    
    {/* Only for owner */}
    {userRole === 'owner' && <button>Delete</button>}
  </>
);
```

---

## Styling Conventions

### Color Usage
- **Blue** - Primary actions, stats, links
- **Green** - Success, positive indicators
- **Red** - Danger, delete, errors
- **Purple** - Secondary, rules
- **Yellow** - Warnings
- **Gray** - Neutral, disabled

### Component Sizing
- **Large buttons:** `px-4 py-2` (minimum 44px height)
- **Small badges:** `px-2 py-1` with `text-xs`
- **Icons:** `text-2xl` for headers, `text-lg` for inline
- **Padding:** `p-4` standard, `p-6` for sections

### Responsive Breakpoints
- **Mobile:** < 640px (1 column)
- **Tablet:** 640-1024px (2 columns)
- **Desktop:** > 1024px (3 columns)

---

## Testing Quick Checklist

- [ ] Navigate to `/languages/{id}`
- [ ] Page loads with data
- [ ] All 4 tabs clickable
- [ ] Overview sections expandable
- [ ] Dictionary searchable
- [ ] Rules filterable
- [ ] Courses display correctly
- [ ] Edit button opens modal
- [ ] Visibility button opens modal
- [ ] Changes save to Supabase
- [ ] Role-based buttons show/hide
- [ ] Mobile layout responsive
- [ ] Dark mode works
- [ ] Error states show
- [ ] Loading states show

---

## Common Issues & Solutions

### Issue: "Could not find X column"
**Solution:** Run `docs/FIX_SCHEMA_CACHE.sql` and refresh browser

### Issue: User role not determining correctly
**Solution:** Check language_collaborators table has entry for user
```sql
SELECT * FROM language_collaborators 
WHERE language_id = 'xxx' AND user_id = 'yyy'
```

### Issue: Edit button not showing for owner
**Solution:** Check that `userRole === 'owner'` evaluation
```tsx
console.log('userRole:', userRole); // Debug in console
```

### Issue: Modal not opening
**Solution:** Check state is being set:
```tsx
console.log('isEditModalOpen:', isEditModalOpen); // Should toggle
```

### Issue: Supabase query returning empty
**Solution:** Check RLS policies allow user access
```tsx
// Add logging:
console.log('userId:', user.id);
console.log('languageId:', languageId);
```

---

## Performance Tips

1. **Use useCallback for event handlers** if passing to child components
2. **Memoize DictionaryTab, RulesTab, CoursesTab** to prevent unnecessary re-renders
3. **Paginate dictionary/rules** if list gets large (>500 items)
4. **Lazy load courses** with "Load More" button

---

## Future Extensions

### Phase 2.1 - Add Word Modal
```tsx
<AddWordModal
  languageId={language.id}
  onSuccess={(newWord) => setWords([...words, newWord])}
/>
```

### Phase 2.6 - Add Rule Modal
```tsx
<AddRuleModal
  languageId={language.id}
  onSuccess={(newRule) => setRules([...rules, newRule])}
/>
```

### Phase 3.1 - Collaboration Indicators
```tsx
<CollaboratorsSection language={language} />
```

### Phase 4.1 - Real-time Sync
```tsx
// Replace queries with Supabase subscriptions
supabaseClient
  .from('languages')
  .on('*', payload => { setLanguage(payload.new) })
  .subscribe()
```

---

## Documentation Files

| Document | Purpose |
|----------|---------|
| [P1_4_LANGUAGE_DASHBOARD.md](P1_4_LANGUAGE_DASHBOARD.md) | Full implementation guide |
| [P1_4_TESTING_GUIDE.md](P1_4_TESTING_GUIDE.md) | Manual testing scenarios |
| P1_4_QUICK_REFERENCE.md | This file |

---

**Last Updated:** January 1, 2026  
**Version:** 1.0  
**Status:** Complete ✅
