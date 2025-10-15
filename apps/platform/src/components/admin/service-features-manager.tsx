"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, GripVertical, Check, Minus } from "lucide-react";

interface ServiceFeature {
  id?: string;
  title: string;
  description?: string;
  icon?: string;
  included: boolean;
  sort_order: number;
}

interface ServiceFeaturesManagerProps {
  serviceSlug?: string;
  initialFeatures?: ServiceFeature[];
  onChange?: (features: ServiceFeature[]) => void;
}

export function ServiceFeaturesManager({
  serviceSlug,
  initialFeatures = [],
  onChange,
}: ServiceFeaturesManagerProps) {
  const [features, setFeatures] = useState<ServiceFeature[]>(initialFeatures);
  const [newFeature, setNewFeature] = useState<Partial<ServiceFeature>>({
    title: "",
    description: "",
    icon: "",
    included: true,
    sort_order: 0,
  });
  const [isAdding, setIsAdding] = useState(false);

  // Update parent component when features change
  useEffect(() => {
    if (onChange) {
      onChange(features);
    }
  }, [features, onChange]);

  const addFeature = () => {
    if (!newFeature.title?.trim()) return;

    const feature: ServiceFeature = {
      title: newFeature.title.trim(),
      description: newFeature.description?.trim() || undefined,
      icon: newFeature.icon?.trim() || undefined,
      included: newFeature.included ?? true,
      sort_order: features.length,
    };

    setFeatures([...features, feature]);
    setNewFeature({
      title: "",
      description: "",
      icon: "",
      included: true,
      sort_order: 0,
    });
    setIsAdding(false);
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = features.filter((_, i) => i !== index);
    // Update sort orders
    const reorderedFeatures = updatedFeatures.map((feature, i) => ({
      ...feature,
      sort_order: i,
    }));
    setFeatures(reorderedFeatures);
  };

  const updateFeature = (index: number, updates: Partial<ServiceFeature>) => {
    const updatedFeatures = features.map((feature, i) =>
      i === index ? { ...feature, ...updates } : feature,
    );
    setFeatures(updatedFeatures);
  };

  const moveFeature = (fromIndex: number, toIndex: number) => {
    const updatedFeatures = [...features];
    const [movedFeature] = updatedFeatures.splice(fromIndex, 1);
    updatedFeatures.splice(toIndex, 0, movedFeature);

    // Update sort orders
    const reorderedFeatures = updatedFeatures.map((feature, i) => ({
      ...feature,
      sort_order: i,
    }));
    setFeatures(reorderedFeatures);
  };

  return (
    <Card className="rounded-none border border-neutral-200 dark:border-neutral-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Service Features</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="rounded-none"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Feature
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Features */}
        {features.length > 0 ? (
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border rounded-none bg-muted/20"
              >
                <div className="cursor-move">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={feature.title}
                      onChange={(e) =>
                        updateFeature(index, { title: e.target.value })
                      }
                      placeholder="Feature title"
                      className="rounded-none"
                    />
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={feature.included}
                        onCheckedChange={(checked) =>
                          updateFeature(index, { included: checked })
                        }
                      />
                      <Badge
                        variant={feature.included ? "default" : "secondary"}
                        className="rounded-none"
                      >
                        {feature.included ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Included
                          </>
                        ) : (
                          <>
                            <Minus className="h-3 w-3 mr-1" />
                            Excluded
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>

                  {feature.description && (
                    <Textarea
                      value={feature.description}
                      onChange={(e) =>
                        updateFeature(index, { description: e.target.value })
                      }
                      placeholder="Feature description (optional)"
                      className="rounded-none text-sm"
                      rows={2}
                    />
                  )}
                </div>

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeFeature(index)}
                  className="rounded-none"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No features added yet.</p>
            <p className="text-sm">Click "Add Feature" to get started.</p>
          </div>
        )}

        {/* Add New Feature Form */}
        {isAdding && (
          <div className="p-4 border rounded-none bg-blue-50/50 dark:bg-blue-900/20 space-y-3">
            <h4 className="font-medium">Add New Feature</h4>

            <Input
              value={newFeature.title || ""}
              onChange={(e) =>
                setNewFeature({ ...newFeature, title: e.target.value })
              }
              placeholder="Feature title *"
              className="rounded-none"
            />

            <Textarea
              value={newFeature.description || ""}
              onChange={(e) =>
                setNewFeature({ ...newFeature, description: e.target.value })
              }
              placeholder="Feature description (optional)"
              className="rounded-none"
              rows={2}
            />

            <div className="flex items-center gap-2">
              <Switch
                checked={newFeature.included ?? true}
                onCheckedChange={(checked) =>
                  setNewFeature({ ...newFeature, included: checked })
                }
              />
              <span className="text-sm">Include this feature</span>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={addFeature}
                disabled={!newFeature.title?.trim()}
                className="rounded-none"
              >
                Add Feature
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewFeature({
                    title: "",
                    description: "",
                    icon: "",
                    included: true,
                    sort_order: 0,
                  });
                }}
                className="rounded-none"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
