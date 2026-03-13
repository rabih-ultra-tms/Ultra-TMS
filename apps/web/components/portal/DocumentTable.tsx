'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';

export interface Document {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  url?: string;
  shipmentId?: string;
}

interface DocumentTableProps {
  documents: Document[];
}

export function DocumentTable({ documents }: DocumentTableProps) {
  const [filter, setFilter] = useState<string>('');

  const filtered = documents.filter((d) =>
    filter ? d.type.toLowerCase() === filter.toLowerCase() : true
  );

  const documentTypes = Array.from(new Set(documents.map((d) => d.type)));

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Documents
          </h3>
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setFilter('')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                !filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {documentTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  filter === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="mb-4 h-12 w-12 text-gray-300" />
            <p className="text-sm text-slate-500">No documents found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-700">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">
                    Date
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-slate-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="py-3 px-4 text-slate-900 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      {doc.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                        {doc.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (doc.url) {
                            window.open(doc.url, '_blank');
                          }
                        }}
                        disabled={!doc.url}
                      >
                        <Download className="mr-1 h-4 w-4" />
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}
