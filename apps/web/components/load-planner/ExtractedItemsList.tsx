'use client'

import { useState } from 'react'
import type { LoadItem } from '@/lib/load-planner/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Pencil, Trash2, Check, X, ChevronDown, ChevronUp, Package, Copy, AlertTriangle, Layers, Box, Upload, Image as ImageIcon, XCircle } from 'lucide-react'

interface ExtractedItemsListProps {
  items: LoadItem[]
  onChange: (items: LoadItem[]) => void
}

export function ExtractedItemsList({ items, onChange }: ExtractedItemsListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<LoadItem>>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [uploadingImageFor, setUploadingImageFor] = useState<string | null>(null)

  // Filter items to separate parents and children
  const parentItems = items.filter(item => !item.parentCargoId)
  const getChildItems = (parentId: string) => items.filter(item => item.parentCargoId === parentId)

  const handleEdit = (item: LoadItem) => {
    setEditingId(item.id)
    setEditValues({
      description: item.description,
      length: item.length,
      width: item.width,
      height: item.height,
      weight: item.weight,
      quantity: item.quantity,
      stackable: item.stackable ?? false,
      fragile: item.fragile ?? false,
      hazmat: item.hazmat ?? false,
      bottomOnly: item.bottomOnly ?? false,
      maxLayers: item.maxLayers,
      orientation: item.orientation ?? 3,
      geometry: item.geometry ?? 'box',
    })
  }

  const handleSave = () => {
    if (!editingId) return

    onChange(items.map(item =>
      item.id === editingId
        ? { ...item, ...editValues }
        : item
    ))
    setEditingId(null)
    setEditValues({})
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditValues({})
  }

  const handleDelete = (id: string) => {
    onChange(items.filter(item => item.id !== id))
  }

  const handleDuplicate = (item: LoadItem) => {
    const newItem: LoadItem = {
      ...item,
      id: `item-${Date.now()}`,
      description: `${item.description} (copy)`
    }
    onChange([...items, newItem])
  }

  const handleImageUpload = async (file: File, itemId: string) => {
    try {
      setUploadingImageFor(itemId)

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/v1/operations/load-planner-quotes/cargo-images/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      const imageUrl = result.data.url

      // Update the item with the new image URL
      onChange(items.map(item => {
        if (item.id === itemId) {
          const currentImages = item.imageUrls || []
          return { ...item, imageUrls: [...currentImages, imageUrl] }
        }
        return item
      }))
    } catch (error) {
      console.error('Image upload failed:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploadingImageFor(null)
    }
  }

  const handleRemoveImage = (itemId: string, imageUrl: string) => {
    onChange(items.map(item => {
      if (item.id === itemId) {
        const updatedImages = (item.imageUrls || []).filter(url => url !== imageUrl)
        return { ...item, imageUrls: updatedImages }
      }
      return item
    }))
  }

  const formatDimensions = (item: LoadItem) => {
    return `${item.length.toFixed(1)}' x ${item.width.toFixed(1)}' x ${item.height.toFixed(1)}'`
  }

  const formatWeight = (weight: number) => {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(1)}k lbs`
    }
    return `${weight.toLocaleString()} lbs`
  }

  return (
    <div className="space-y-2">
      {items.length > 0 && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {parentItems.length} item{parentItems.length !== 1 ? 's' : ''} ({items.reduce((sum, i) => sum + i.quantity, 0)} total units)
          </span>
          {parentItems.length > 3 && (
            <span className="text-xs text-muted-foreground">Scroll to see all</span>
          )}
        </div>
      )}

      {items.length === 0 && (
        <div className="py-8 text-center">
          <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-500 mb-1">No items added yet</p>
          <p className="text-xs text-gray-400">
            Upload a file or add items manually
          </p>
        </div>
      )}

      <div className="max-h-[400px] overflow-y-auto space-y-2">
        {parentItems.map((item) => {
          const childItems = getChildItems(item.id)
          return (
          <div
            key={item.id}
            className={`
              border rounded-lg transition-all
              ${editingId === item.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
            `}
          >
            {editingId === item.id ? (
              <div className="p-3 space-y-3">
                <Input
                  value={editValues.description || ''}
                  onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                  placeholder="Item name"
                  className="font-medium"
                />

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">Length (ft)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={editValues.length || 0}
                      onChange={(e) => setEditValues({ ...editValues, length: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Width (ft)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={editValues.width || 0}
                      onChange={(e) => setEditValues({ ...editValues, width: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Height (ft)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={editValues.height || 0}
                      onChange={(e) => setEditValues({ ...editValues, height: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Weight (lbs)</label>
                    <Input
                      type="number"
                      value={editValues.weight || 0}
                      onChange={(e) => setEditValues({ ...editValues, weight: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Quantity</label>
                    <Input
                      type="number"
                      min="1"
                      value={editValues.quantity || 1}
                      onChange={(e) => setEditValues({ ...editValues, quantity: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                <Separator className="my-3" />
                <div className="space-y-3">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    Cargo Options
                  </Label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`stackable-${item.id}`}
                        checked={editValues.stackable || false}
                        onCheckedChange={(checked) => setEditValues({ ...editValues, stackable: checked })}
                      />
                      <Label htmlFor={`stackable-${item.id}`} className="text-xs">Stackable</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        id={`fragile-${item.id}`}
                        checked={editValues.fragile || false}
                        onCheckedChange={(checked) => setEditValues({ ...editValues, fragile: checked })}
                      />
                      <Label htmlFor={`fragile-${item.id}`} className="text-xs">Fragile</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        id={`hazmat-${item.id}`}
                        checked={editValues.hazmat || false}
                        onCheckedChange={(checked) => setEditValues({ ...editValues, hazmat: checked })}
                      />
                      <Label htmlFor={`hazmat-${item.id}`} className="text-xs text-red-600">Hazmat</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        id={`bottomOnly-${item.id}`}
                        checked={editValues.bottomOnly || false}
                        onCheckedChange={(checked) => setEditValues({ ...editValues, bottomOnly: checked })}
                      />
                      <Label htmlFor={`bottomOnly-${item.id}`} className="text-xs">Bottom Only</Label>
                    </div>
                  </div>

                  {editValues.stackable && (
                    <div className="flex items-center gap-3">
                      <Label className="text-xs whitespace-nowrap">Max Layers:</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={editValues.maxLayers || ''}
                        onChange={(e) => setEditValues({
                          ...editValues,
                          maxLayers: e.target.value ? parseInt(e.target.value) : undefined
                        })}
                        placeholder="Unlimited"
                        className="w-24 h-8"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Shape</Label>
                      <Select
                        value={editValues.geometry || 'box'}
                        onValueChange={(value) => setEditValues({
                          ...editValues,
                          geometry: value as 'box' | 'cylinder' | 'hollow-cylinder'
                        })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="box">Box</SelectItem>
                          <SelectItem value="cylinder">Cylinder</SelectItem>
                          <SelectItem value="hollow-cylinder">Hollow Cylinder</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Orientation</Label>
                      <Select
                        value={String(editValues.orientation || 3)}
                        onValueChange={(value) => setEditValues({
                          ...editValues,
                          orientation: parseInt(value) as 1 | 3 | 63
                        })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Fixed (No Rotation)</SelectItem>
                          <SelectItem value="3">Rotatable (Default)</SelectItem>
                          <SelectItem value="63">Tiltable (Any Position)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator className="my-3" />
                <div className="space-y-3">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    Cargo Images
                  </Label>

                  {/* Display existing images */}
                  {item.imageUrls && item.imageUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {item.imageUrls.map((url, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={url}
                            alt={`Cargo ${idx + 1}`}
                            className="w-full h-24 object-cover rounded border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(item.id, url)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <XCircle className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload button */}
                  <div>
                    <input
                      type="file"
                      id={`image-upload-${item.id}`}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleImageUpload(file, item.id)
                        }
                      }}
                      disabled={uploadingImageFor === item.id}
                    />
                    <label htmlFor={`image-upload-${item.id}`}>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={uploadingImageFor === item.id}
                        onClick={(e) => {
                          e.preventDefault()
                          document.getElementById(`image-upload-${item.id}`)?.click()
                        }}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        {uploadingImageFor === item.id ? 'Uploading...' : 'Upload Image'}
                      </Button>
                    </label>
                  </div>
                </div>

                <div className="flex gap-1 mt-4 justify-end">
                  <Button size="sm" onClick={handleSave}>
                    <Check className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">{item.description}</span>
                      {item.quantity > 1 && (
                        <span className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">
                          x{item.quantity}
                        </span>
                      )}
                      {item.hazmat && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                          HAZMAT
                        </Badge>
                      )}
                      {item.fragile && (
                        <Badge variant="outline" className="text-orange-600 border-orange-300 text-[10px] px-1.5 py-0">
                          Fragile
                        </Badge>
                      )}
                      {expandedId === item.id ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>

                    {/* Show summary ribbon if item contains children, otherwise show dimensions */}
                    {childItems.length > 0 ? (
                      <div className="mt-1.5 flex items-center gap-3 text-xs bg-blue-50 border border-blue-200 rounded px-2 py-1.5">
                        <span className="text-blue-600 font-medium">Calculated from items:</span>
                        <span className="text-gray-600">
                          Length (sum): <span className="font-medium text-gray-900">
                            {childItems.reduce((sum, child) => sum + child.length, 0).toFixed(1)}'
                          </span>
                        </span>
                        <span className="text-gray-600">
                          Width (max): <span className="font-medium text-gray-900">
                            {Math.max(...childItems.map(child => child.width)).toFixed(1)}'
                          </span>
                        </span>
                        <span className="text-gray-600">
                          Height (max): <span className="font-medium text-gray-900">
                            {Math.max(...childItems.map(child => child.height)).toFixed(1)}'
                          </span>
                        </span>
                        <span className="text-gray-600">
                          Weight (total): <span className="font-medium text-gray-900">
                            {formatWeight(childItems.reduce((sum, child) => sum + child.weight, 0))}
                          </span>
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 mt-0.5">
                        {formatDimensions(item)} &bull; {formatWeight(item.weight)}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => handleEdit(item)}
                      title="Edit item"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDuplicate(item)}
                      title="Duplicate item"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(item.id)}
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {expandedId === item.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {/* Display images if available */}
                    {item.imageUrls && item.imageUrls.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          Cargo Images
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {item.imageUrls.map((url, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={url}
                                alt={`${item.description} - Image ${idx + 1}`}
                                className="w-full h-20 object-cover rounded border border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
                                onClick={() => window.open(url, '_blank')}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {item.stackable && (
                        <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                          Stackable{item.maxLayers ? ` (max ${item.maxLayers})` : ''}
                        </Badge>
                      )}
                      {item.bottomOnly && (
                        <Badge variant="outline" className="text-blue-600 border-blue-300 text-xs">
                          Bottom Only
                        </Badge>
                      )}
                      {item.geometry && (
                        <Badge variant="outline" className="text-purple-600 border-purple-300 text-xs flex items-center gap-1">
                          <Box className="w-3 h-3" />
                          {item.geometry === 'box' ? 'Box' : item.geometry === 'cylinder' ? 'Cylinder' : 'Hollow Cylinder'}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-600">
                      <div>
                        <div className="text-gray-400">Quantity</div>
                        <div className="font-medium text-gray-800">{item.quantity}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Weight</div>
                        <div className="font-medium text-gray-800">{formatWeight(item.weight)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Orientation</div>
                        <div className="font-medium text-gray-800">
                          {item.orientation === 1 ? 'Fixed' : item.orientation === 63 ? 'Tiltable' : 'Rotatable'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Status</div>
                        <div className="font-medium text-gray-800">
                          {item.weight > 20000 || item.width > 8.5 || item.height > 13.5 ? (
                            <span className="text-yellow-600 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Oversize
                            </span>
                          ) : (
                            <span className="text-green-600">Standard</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Inner Cargo Items */}
                    {childItems.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-blue-100 bg-blue-50/30 -mx-3 px-3 pb-2 rounded-b-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Layers className="w-3 h-3 text-blue-600" />
                          <span className="text-xs font-medium text-blue-900">
                            Items Inside ({childItems.length})
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {childItems.map((childItem) => (
                            <div
                              key={childItem.id}
                              className="flex items-center justify-between p-2 bg-white rounded border border-blue-100 text-xs"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900 truncate">
                                    {childItem.description}
                                  </span>
                                  {childItem.loadType && (
                                    <Badge variant="outline" className="text-[10px] px-1 py-0 bg-blue-50 text-blue-700 border-blue-200">
                                      {childItem.loadType}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-gray-500 flex gap-2 mt-0.5">
                                  <span>{formatDimensions(childItem)}</span>
                                  <span>&bull;</span>
                                  <span>{formatWeight(childItem.weight)}</span>
                                </div>
                              </div>
                              <div className="flex gap-1 ml-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEdit(childItem)
                                  }}
                                  title="Edit item"
                                >
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete(childItem.id)
                                  }}
                                  title="Delete item"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )
        })}
      </div>

      {items.length > 0 && (
        <div className="pt-3 border-t border-gray-200 text-sm text-gray-500">
          <div className="flex justify-between">
            <span>Total Items:</span>
            <span className="font-medium text-gray-700">
              {items.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total Weight:</span>
            <span className="font-medium text-gray-700">
              {formatWeight(items.reduce((sum, i) => sum + (i.weight * i.quantity), 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
