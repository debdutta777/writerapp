// ... existing code ...
              <div key={index} className="flex justify-center">
                <div className="relative w-full max-w-2xl h-96">
                  <Image
                    src={image}
                    alt={`Illustration ${index + 1} for Chapter ${chapter.chapterNumber}`}
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chapter navigation */}
        <div className="mt-12 flex justify-between">
          {prevChapter ? (
            <Link
              href={`/novels/${id}/chapters/${prevChapter}`}
              className="text-blue-600 hover:text-blue-500"
            >
              ← Previous Chapter
            </Link>
          ) : (
            <span></span>
          )}
          {nextChapter && (
            <Link
              href={`/novels/${id}/chapters/${nextChapter}`}
              className="text-blue-600 hover:text-blue-500"
            >
              Next Chapter →
            </Link>
          )}
        </div>
      </article>
    </div>
  );
}