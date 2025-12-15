import { safeFetch } from '@/sanity/safeFetch';
import { NAVIGATION_STRUCTURE_QUERY } from '@/sanity/queries';
import { HierarchicalNavigationClient } from './HierarchicalNavigationClient';

export async function HierarchicalNavigation() {
  const navStructure = await safeFetch(
    NAVIGATION_STRUCTURE_QUERY,
    {}, // params
    []  // fallback
  );

  return <HierarchicalNavigationClient structure={navStructure || []} />;
}
