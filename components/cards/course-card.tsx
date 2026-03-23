import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Clock, Users, BookOpen, Heart } from "lucide-react"
import type { Course } from "@/constants/courses"

interface CourseCardProps {
  course: Course
}

export function CourseCard({ course }: CourseCardProps) {
  const discountPercentage = course.originalPrice
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative">
          <img
            src={course.image || "/placeholder.svg"}
            alt={course.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {discountPercentage > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">-{discountPercentage}%</Badge>
          )}
          <Button variant="ghost" size="sm" className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white">
            <Heart className="h-4 w-4" />
          </Button>
          <Badge className="absolute bottom-2 left-2 bg-blue-600 hover:bg-blue-700">{course.level}</Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Badge variant="outline" className="text-xs">
            {course.category}
          </Badge>
          {course.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
          {course.title}
        </h3>

        <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>

        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={course.instructorAvatar || "/placeholder.svg"} />
            <AvatarFallback className="text-xs">
              {course.instructor
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-600">{course.instructor}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{course.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{course.studentsCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.duration}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <BookOpen className="h-4 w-4" />
          <span>{course.lessons} уроков</span>
          {course.certificate && (
            <Badge variant="outline" className="text-xs">
              Сертификат
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-blue-600">{course.price.toLocaleString()} ₸</span>
          {course.originalPrice && (
            <span className="text-sm text-gray-500 line-through">{course.originalPrice.toLocaleString()} ₸</span>
          )}
        </div>
        <Link href={`/courses/${course.id}`}>
          <Button className="bg-blue-600 hover:bg-blue-700">Подробнее</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
