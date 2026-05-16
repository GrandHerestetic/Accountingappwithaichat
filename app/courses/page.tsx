"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, X, BookOpen, Loader2 } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { listCourses } from "@/lib/api"
import type { Course, PaginatedResponse } from "@/lib/api/types"
import { toast } from "sonner"
import Link from "next/link"

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  // ---------------------------------------------------------------------------
  // Fetch published courses from the API
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true)
      try {
        const data = await listCourses({ page: 1, pageSize: 20 })
        // Display only published courses (requirement 7.1)
        setCourses(data.items.filter((c) => c.status === "published"))
      } catch (err) {
        const message = err instanceof Error ? err.message : "Не удалось загрузить курсы"
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  // ---------------------------------------------------------------------------
  // Client-side filtering and sorting
  // ---------------------------------------------------------------------------
  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(courses.map((c) => c.category).filter((c): c is string => Boolean(c)))
    )
    return cats.sort()
  }, [courses])

  const filteredCourses = useMemo(() => {
    let filtered = courses

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.description ?? "").toLowerCase().includes(q) ||
          (c.category ?? "").toLowerCase().includes(q)
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((c) => c.category === selectedCategory)
    }

    const sorted = [...filtered]
    switch (sortBy) {
      case "newest":
        sorted.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        break
      case "oldest":
        sorted.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        break
      default:
        break
    }

    return sorted
  }, [courses, searchQuery, selectedCategory, sortBy])

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSortBy("newest")
  }

  const hasActiveFilters = searchQuery || selectedCategory !== "all"

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Page header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Курсы по бухгалтерскому учету
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Изучайте бухгалтерский учет, налогообложение и финансовый анализ с ведущими экспертами
            </p>
            {!loading && (
              <div className="flex flex-wrap justify-center gap-6 mt-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <BookOpen className="h-5 w-5" />
                  <span className="font-medium">{courses.length} курсов</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Поиск и фильтры
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по названию или описанию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Категория" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Сортировка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Сначала новые</SelectItem>
                  <SelectItem value="oldest">Сначала старые</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <X className="h-4 w-4" />
                  Очистить
                </Button>
              )}
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Поиск: &quot;{searchQuery}&quot;
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                  </Badge>
                )}
                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {selectedCategory}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("all")} />
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Results count */}
        {!loading && (
          <div className="mb-6">
            <p className="text-gray-600">
              Найдено курсов: <span className="font-medium">{filteredCourses.length}</span>
            </p>
          </div>
        )}

        {/* Course grid */}
        {!loading && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md overflow-hidden flex flex-col"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {course.category ?? "Без категории"}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>
                </CardHeader>

                <CardContent className="flex-1">
                  <p className="text-sm text-gray-600 line-clamp-3">{course.description}</p>
                  <p className="text-xs text-gray-400 mt-3">
                    Добавлен: {new Date(course.created_at).toLocaleDateString("ru-RU")}
                  </p>
                </CardContent>

                <CardFooter className="pt-0">
                  <Link href={`/courses/${course.id}`} className="w-full">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Подробнее</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredCourses.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Курсы не найдены</h3>
              <p className="text-gray-600 mb-4">
                Попробуйте изменить параметры поиска или очистить фильтры
              </p>
              {hasActiveFilters && <Button onClick={clearFilters}>Очистить фильтры</Button>}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
