import React, { useEffect, useState } from "react";
import { DocumentData, getDocs, Query } from "firebase/firestore";
//Simple Hook to return document data from Firebase query and last document from that query
// It should only be used when we need to fetch more data, its not loading first batch.
export const usePaginationFB = (
  query: Query<DocumentData>
): [unknown, DocumentData | null] => {
  const [data, setData] = useState<unknown[]>([]);
  const [lastDoc, setLastDoc] = useState<DocumentData | null>(null);
  useEffect(() => {
    const fetchFromDB = async () => {
      const tempArr: unknown[] = [];
      const docs = await getDocs(query);
      docs.forEach((item) => {
        tempArr.push(item.data());
      });
      setLastDoc(docs.docs[docs.size - 1]);
      setData(tempArr);
    };
    fetchFromDB();
  }, []);
  return [data, lastDoc];
};
