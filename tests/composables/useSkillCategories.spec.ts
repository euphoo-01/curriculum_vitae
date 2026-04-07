import { describe, it, expect, vi } from 'vitest';
import { useSkillCategories } from '../../app/composables/useSkillCategories';
import { ref } from 'vue';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => `translated_${key}`,
  }),
}));

describe('useSkillCategories', () => {
  it('groups skills into their respective categories', () => {
    const skills = ref([
      { id: 's1', name: 'Vue', categoryId: 'c1' },
      { id: 's2', name: 'React', categoryId: 'c1' },
      { id: 's3', name: 'Node', categoryId: 'c2' },
    ]);
    const categories = ref([
      { id: 'c1', name: 'Frontend', order: 2 },
      { id: 'c2', name: 'Backend', order: 1 },
    ]);

    const { categoriesWithSkills } = useSkillCategories(skills, categories);

    expect(categoriesWithSkills.value).toHaveLength(2);

    expect(categoriesWithSkills.value[0].id).toBe('c2');
    expect(categoriesWithSkills.value[0].skills).toHaveLength(1);
    expect(categoriesWithSkills.value[1].id).toBe('c1');
    expect(categoriesWithSkills.value[1].skills).toHaveLength(2);
  });

  it('puts skills without a category or with an unknown category into the uncategorized group', () => {
    const skills = ref([
      { id: 's1', name: 'No Cat' },
      { id: 's2', name: 'Null Cat', categoryId: null },
      { id: 's3', name: 'Unknown Cat', categoryId: 'c99' },
    ]);
    const categories = ref([{ id: 'c1', name: 'Frontend', order: 1 }]);

    const { categoriesWithSkills } = useSkillCategories(skills, categories);

    expect(categoriesWithSkills.value).toHaveLength(1);
    expect(categoriesWithSkills.value[0].id).toBe('uncategorized');
    expect(categoriesWithSkills.value[0].name).toBe(
      'translated_skills.uncategorized'
    );
    expect(categoriesWithSkills.value[0].skills).toHaveLength(3);
  });

  it('ignores empty categories', () => {
    const skills = ref([{ id: 's1', name: 'Vue', categoryId: 'c1' }]);
    const categories = ref([
      { id: 'c1', name: 'Frontend', order: 1 },
      { id: 'c2', name: 'Backend', order: 2 },
    ]);

    const { categoriesWithSkills } = useSkillCategories(skills, categories);

    expect(categoriesWithSkills.value).toHaveLength(1);
    expect(categoriesWithSkills.value[0].id).toBe('c1');
  });
});
