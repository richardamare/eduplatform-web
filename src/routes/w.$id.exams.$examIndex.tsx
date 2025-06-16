import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { WorkspaceId } from '@/types/workspace'
import { GeneratedContentQueries } from '@/data-access/generated-content'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/w/$id/exams/$examIndex')({
  component: ExamDetail,
})

function ExamDetail() {
  const { id, examIndex } = Route.useParams()
  const navigate = useNavigate()
  const workspaceIdTyped = WorkspaceId.make(id)
  const examIndexNumber = parseInt(examIndex, 10)

  const examsQuery = GeneratedContentQueries.useExams(workspaceIdTyped)
  const exams = examsQuery.data ?? []
  const currentExam = exams[examIndexNumber]

  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({})
  const [showResults, setShowResults] = useState(false)

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    if (!showResults) {
      setSelectedAnswers((prev) => ({
        ...prev,
        [questionIndex]: answer,
      }))
    }
  }

  const handleSubmitExam = () => {
    setShowResults(true)
  }

  const answerOptions = ['A', 'B', 'C', 'D'] as const

  const isCorrectAnswer = (questionIndex: number, answer: string) => {
    const correctAnswer = currentExam.items[
      questionIndex
    ].correctAnswer.replace('answer', '')
    return correctAnswer === answer
  }

  const getAnswerColor = (questionIndex: number, option: string) => {
    if (!showResults) {
      return selectedAnswers[questionIndex] === option
        ? 'bg-blue-100 border-blue-500'
        : 'bg-white border-gray-200'
    }

    const isSelected = selectedAnswers[questionIndex] === option
    const isCorrect = isCorrectAnswer(questionIndex, option)

    if (isCorrect) {
      return 'bg-green-100 border-green-500 text-green-800'
    }

    if (isSelected && !isCorrect) {
      return 'bg-red-100 border-red-500 text-red-800'
    }

    return 'bg-gray-50 border-gray-200'
  }

  const getCorrectAnswersCount = () => {
    return Object.entries(selectedAnswers).filter(([questionIndex, answer]) =>
      isCorrectAnswer(parseInt(questionIndex), answer),
    ).length
  }

  const totalQuestions = currentExam?.items.length ?? 0
  const correctAnswers = showResults ? getCorrectAnswersCount() : 0

  if (!currentExam) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Exam not found</h1>
        <button
          onClick={() => navigate({ to: `/w/${id}` })}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Workspace
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate({ to: `/w/${id}` })}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Workspace
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-bold">{currentExam.topic}</h1>
          <p className="text-muted-foreground">{totalQuestions} questions</p>
          {showResults && (
            <p className="text-lg font-semibold mt-2">
              Score: {correctAnswers}/{totalQuestions} (
              {Math.round((correctAnswers / totalQuestions) * 100)}%)
            </p>
          )}
        </div>
        <div className="w-24" /> {/* Spacer for centering */}
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {currentExam.items.map((item, idx) => (
          <div key={idx} className="bg-white border rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="font-bold text-lg text-muted-foreground">
                  {idx + 1}.
                </span>
                <h3 className="text-lg font-medium leading-relaxed">
                  {item.question}
                </h3>
                {showResults && (
                  <div className="ml-auto">
                    {isCorrectAnswer(idx, selectedAnswers[idx] || '') ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                )}
              </div>

              <div className="grid gap-3 pl-8">
                {answerOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswerSelect(idx, option)}
                    disabled={showResults}
                    className={`text-left p-3 border rounded-lg transition-colors hover:bg-gray-50 ${getAnswerColor(
                      idx,
                      option,
                    )} ${showResults ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex gap-3">
                      <span className="font-semibold">{option}.</span>
                      <span>{item.answers[option]}</span>
                    </div>
                  </button>
                ))}
              </div>

              {showResults && (
                <div className="pl-8 pt-2 text-sm text-muted-foreground">
                  Correct answer:{' '}
                  <span className="font-semibold text-green-700">
                    {item.correctAnswer.replace('answer', '')}){' '}
                    {
                      item.answers[
                        item.correctAnswer.replace(
                          'answer',
                          '',
                        ) as keyof typeof item.answers
                      ]
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      {!showResults && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={handleSubmitExam}
            disabled={Object.keys(selectedAnswers).length !== totalQuestions}
            className="px-8 py-3 text-lg"
          >
            Vyhodnotit
          </Button>
        </div>
      )}

      {/* Restart Button */}
      {showResults && (
        <div className="flex justify-center gap-4 pt-6">
          <Button
            onClick={() => {
              setSelectedAnswers({})
              setShowResults(false)
            }}
            variant="outline"
            className="px-6 py-3"
          >
            Restart Exam
          </Button>
          <Button
            onClick={() => navigate({ to: `/w/${id}` })}
            className="px-6 py-3"
          >
            Back to Workspace
          </Button>
        </div>
      )}
    </div>
  )
}
