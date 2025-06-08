import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import { WorkspaceId } from '@/types/workspace'
import { GeneratedContentQueries } from '@/data-access/generated-content'

export const Route = createFileRoute('/w/$id/flashcards/$setIndex')({
  component: FlashcardDetail,
})

function FlashcardDetail() {
  const { id, setIndex } = Route.useParams()
  const navigate = useNavigate()
  const workspaceIdTyped = WorkspaceId.make(id)
  const setIndexNumber = parseInt(setIndex, 10)

  const flashcardsQuery =
    GeneratedContentQueries.useFlashcards(workspaceIdTyped)
  const flashcardSets = flashcardsQuery.data ?? []
  const currentSet = flashcardSets[setIndexNumber]

  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  if (!currentSet) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Flashcard set not found</h1>
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

  const currentCard = currentSet.flashcards[currentCardIndex]
  const isFirstCard = currentCardIndex === 0
  const isLastCard = currentCardIndex === currentSet.flashcards.length - 1

  const goToNextCard = () => {
    if (!isLastCard) {
      setCurrentCardIndex((prev) => prev + 1)
      setShowAnswer(false)
    }
  }

  const goToPreviousCard = () => {
    if (!isFirstCard) {
      setCurrentCardIndex((prev) => prev - 1)
      setShowAnswer(false)
    }
  }

  const toggleAnswer = () => {
    setShowAnswer((prev) => !prev)
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
          <h1 className="text-2xl font-bold">{currentSet.topic}</h1>
          <p className="text-muted-foreground">
            {currentCardIndex + 1} of {currentSet.flashcards.length}
          </p>
        </div>
        <div className="w-24" /> {/* Spacer for centering */}
      </div>

      {/* Flashcard */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <div
            className="bg-white border rounded-lg shadow-lg p-8 min-h-[300px] flex flex-col justify-center cursor-pointer hover:shadow-xl transition-shadow"
            onClick={toggleAnswer}
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Question
                </h3>
                <p className="text-lg leading-relaxed">
                  {currentCard.question}
                </p>
              </div>

              {showAnswer && (
                <div className="border-t pt-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Answer
                  </h3>
                  <p className="text-lg leading-relaxed text-green-700">
                    {currentCard.answer}
                  </p>
                </div>
              )}

              {!showAnswer && (
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">
                    Click to reveal answer
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goToPreviousCard}
          disabled={isFirstCard}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <div className="flex gap-2">
          {!showAnswer ? (
            <button
              onClick={toggleAnswer}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Show Answer
            </button>
          ) : (
            <button
              onClick={toggleAnswer}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              Hide Answer
            </button>
          )}
        </div>

        <button
          onClick={goToNextCard}
          disabled={isLastCard}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{
            width: `${((currentCardIndex + 1) / currentSet.flashcards.length) * 100}%`,
          }}
        />
      </div>
    </div>
  )
}
