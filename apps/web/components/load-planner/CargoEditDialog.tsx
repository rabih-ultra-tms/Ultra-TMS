'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Package, ImageIcon } from 'lucide-react'
import type { LoadItem } from '@/lib/load-planner/types'
import { toast } from 'sonner'

interface CargoEditDialogProps {
  item: LoadItem | null
  isOpen: boolean
  onClose: () => void
  onSave: (item: LoadItem) => void
  onDelete?: (id: string) => void
}

export function CargoEditDialog({
  item,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: CargoEditDialogProps) {
  const [description, setDescription] = useState('')
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [stackable, setStackable] = useState(true)
  const [fragile, setFragile] = useState(false)
  const [hazmat, setHazmat] = useState(false)
  const [notes, setNotes] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageUrl2, setImageUrl2] = useState('')

  useEffect(() => {
    if (item) {
      setDescription(item.description || '')
      setLength(item.length.toString())
      setWidth(item.width.toString())
      setHeight(item.height.toString())
      setWeight(item.weight.toString())
      setQuantity((item.quantity || 1).toString())
      setStackable(item.stackable ?? true)
      setFragile(item.fragile ?? false)
      setHazmat(item.hazmat ?? false)
      setNotes('')
      setImageUrl((item as any).imageUrl || '')
      setImageUrl2((item as any).imageUrl2 || '')
    } else {
      setDescription('')
      setLength('')
      setWidth('')
      setHeight('')
      setWeight('')
      setQuantity('1')
      setStackable(true)
      setFragile(false)
      setHazmat(false)
      setNotes('')
      setImageUrl('')
      setImageUrl2('')
    }
  }, [item])

  const handleSave = () => {
    const lengthVal = parseFloat(length) || 0
    const widthVal = parseFloat(width) || 0
    const heightVal = parseFloat(height) || 0
    const weightVal = parseFloat(weight) || 0
    const quantityVal = parseInt(quantity) || 1

    if (!description.trim()) {
      toast.error('Please enter a description')
      return
    }

    if (lengthVal <= 0 || widthVal <= 0 || heightVal <= 0) {
      toast.error('Please enter valid dimensions')
      return
    }

    const updatedItem: LoadItem = {
      id: item?.id || `manual-${Date.now()}`,
      description: description.trim(),
      length: lengthVal,
      width: widthVal,
      height: heightVal,
      weight: weightVal,
      quantity: quantityVal,
      stackable,
      fragile,
      hazmat,
    }

    onSave(updatedItem)
    onClose()
    toast.success(item ? 'Cargo item updated' : 'Cargo item added')
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {item ? 'Edit Cargo Item' : 'Add Cargo Item'}
          </DialogTitle>
          <DialogDescription>
            Enter the cargo details. Dimensions are in feet, weight in pounds.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div>
              <Label className="text-xs font-medium">Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., CAT 320 Excavator"
              />
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label className="text-xs font-medium">Length (ft)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Width (ft)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Height (ft)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Weight (lbs)</Label>
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium">Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <Switch
                  checked={stackable}
                  onCheckedChange={setStackable}
                />
                <Label className="text-sm">Stackable</Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Switch checked={fragile} onCheckedChange={setFragile} />
                <Label className="text-sm">Fragile</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={hazmat} onCheckedChange={setHazmat} />
                <Label className="text-sm text-red-600">Hazmat</Label>
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium">Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special handling notes..."
              />
            </div>
          </TabsContent>

          <TabsContent value="images" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Add image URLs for this cargo item. They will appear in the PDF quote.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium mb-1 block">Primary Image URL</Label>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium mb-1 block">Secondary Image URL</Label>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={imageUrl2}
                    onChange={(e) => setImageUrl2(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          {item && onDelete && (
            <Button variant="destructive" onClick={() => onDelete(item.id)}>
              Delete
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {item ? 'Save Changes' : 'Add Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CargoEditDialog
