import { computed, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

export function useSkillCategories<T extends { categoryId?: string | null }>(
  skillsRef: Ref<T[]>,
  categoriesRef: Ref<Array<{ id: string; name: string; order: number }>>
) {
  const { t } = useI18n();

  const categoriesWithSkills = computed(() => {
    const categoryMap = new Map<
      string,
      {
        id: string;
        name: string;
        skills: T[];
        order: number;
      }
    >();

    categoriesRef.value.forEach((cat) => {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        skills: [],
        order: cat.order,
      });
    });

    categoryMap.set('uncategorized', {
      id: 'uncategorized',
      name: t('skills.uncategorized'),
      skills: [],
      order: 9999,
    });

    skillsRef.value.forEach((skill) => {
      const catId = skill.categoryId || 'uncategorized';
      if (categoryMap.has(catId)) {
        categoryMap.get(catId)!.skills.push(skill);
      } else {
        categoryMap.get('uncategorized')!.skills.push(skill);
      }
    });

    return Array.from(categoryMap.values())
      .filter((c) => c.skills.length > 0)
      .sort((a, b) => a.order - b.order);
  });

  return { categoriesWithSkills };
}
