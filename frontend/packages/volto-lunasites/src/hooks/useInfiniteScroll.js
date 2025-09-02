import { useState, useEffect, useCallback } from 'react';

export const useInfiniteScroll = (items, itemsPerPage = 12) => {
  const [displayedItems, setDisplayedItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Initialize with first batch
  useEffect(() => {
    if (items.length > 0) {
      const initialItems = items.slice(0, itemsPerPage);
      setDisplayedItems(initialItems);
      setHasMore(items.length > itemsPerPage);
      setLoading(false);
    }
  }, [items, itemsPerPage]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);
    
    const currentLength = displayedItems.length;
    const nextItems = items.slice(currentLength, currentLength + itemsPerPage);
    
    if (nextItems.length > 0) {
      setDisplayedItems(prev => [...prev, ...nextItems]);
      setHasMore(currentLength + nextItems.length < items.length);
    } else {
      setHasMore(false);
    }
    
    setLoading(false);
  }, [items, displayedItems.length, itemsPerPage, loading, hasMore]);

  return {
    displayedItems,
    hasMore,
    loading,
    loadMore,
  };
};