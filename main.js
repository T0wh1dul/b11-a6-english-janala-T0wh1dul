let selectedLesson = null
let lessons = null
let currentWords = null

const initializeFaq = () => {
    document.querySelectorAll('.faq-item').forEach(item => {
        const button = item.querySelector('button')
        button.addEventListener('click', () => {
            const content = item.querySelector('div:nth-child(2)')
            const isOpen = button.textContent === '-'
            
            button.textContent = isOpen ? '+' : '-'
            if (content) {
                content.style.display = isOpen ? 'none' : 'block'
            }
        })
        
        if (item !== document.querySelector('.faq-item')) {
            const content = item.querySelector('div:nth-child(2)')
            if (content) content.style.display = 'none'
        }
    })
}

const createLessonButtons = async () => {
    const response = await fetch("https://openapi.programming-hero.com/api/levels/all")
    const json = await response.json()

    if (json.status) {
        const lessonButtonsDiv = document.querySelector(".lessons-div")
        const buttons = []
        lessons = json.data

        json.data.forEach(lesson => {
            const button = `
                <button
                    class="lesson-button rounded border border-primary text-primary text-sm font-semibold flex items-center px-4 py-1 gap-1.5">
                    <span>📖</span>
                    <span>
                        Lesson - ${lesson.level_no}
                    </span>
                </button>
            `
            buttons.push(button)
        })

        lessonButtonsDiv.innerHTML = buttons.join("\n")
    } else {
        console.error("Could not load lessons data")
    }
}


const initializeInformationButtons = () => {
    document.querySelectorAll('.information-button').forEach((button, i) => {
        button.addEventListener('click', async () => {
            button.innerHTML = `
                <div class="animate-spin"> ⏳ </div>
            `
            const currentWordId = currentWords[i].id
            const response = await fetch(`https://openapi.programming-hero.com/api/word/${currentWordId}`)
            const json = await response.json()

            if (json.status) {
                if (json.data.meaning) {
                    const word = json.data
                    Swal.fire({
                        title: `${word.word} (🎙️: ${word.pronunciation})`,
                        html: `
                            <div class="font-semibold font-sm text-gray-700">
                                Meaning
                            </div>
                            <div class="mb-4 text-gray-600 text-xl">
                                ${word.meaning}
                            </div>



                            <div class="font-semibold font-sm text-gray-700">
                                Example
                            </div>
                            <div class="mb-4 text-gray-600 text-xl">
                                ${word.sentence}
                            </div>


                            <div class="font-semibold font-sm text-gray-700">
                                সমার্থক শব্দ গুলো
                            </div>
                            <div class="flex gap-2 flex-wrap justify-center">
                                ${word.synonyms.map(synonym => `<span class="rounded px-3 py-1 bg-blue-100 text-blue-600 font-semibold text-sm">${synonym}</span>`).join(" ")}
                            </div>
                        `,
                        confirmButtonText: "Complete Learning"
                    })

                } else {
                    Swal.fire({
                        title: "Not found",
                        text: "The word meaning is not found.",
                        icon: "error"
                    });

                }
            }

            button.innerHTML = `
                ℹ️
            `
        })
    })
}

const initializePronounceButtons = () => {
    document.querySelectorAll('.pronounce-button').forEach((button, i) => {
        button.addEventListener('click', () => {
            const word = currentWords[i]
            console.log(word)
            const utterance = new SpeechSynthesisUtterance(word.word);
            utterance.lang = 'en-EN'; // English
            window.speechSynthesis.speak(utterance);           
        })        
    })
}


const initializeLessons = () => {
    const buttons = document.querySelectorAll('.lesson-button')
    const noLessonSelected = document.querySelector("#no-lesson-selected")
    const lessonSelected = document.querySelector("#lesson-selected")

    const loadingIndicator = document.querySelector("#loading")
    const noWordsFound = document.querySelector("#no-words-found")
    const wordsFound = document.querySelector("#words")


    buttons.forEach((button, i) => {
        button.addEventListener('click', async () => {
            button.classList.add("bg-primary", "text-white")
            if (selectedLesson === null) {
                noLessonSelected.classList.add("hidden")
                lessonSelected.classList.remove("hidden")
                lessonSelected.classList.add("grid")
            } else {
                const prev = buttons[selectedLesson]
                prev.classList.remove("bg-primary", "text-white")
            }
            selectedLesson = i
            
            loadingIndicator.classList.remove("hidden")
            loadingIndicator.classList.add("flex")

            noWordsFound.classList.remove("flex")
            noWordsFound.classList.add("hidden")

            wordsFound.classList.remove("grid")
            wordsFound.classList.add("hidden")

            const response = await fetch(`https://openapi.programming-hero.com/api/level/${lessons[selectedLesson].level_no}`)
            const json = await response.json()

            loadingIndicator.classList.remove("flex")
            loadingIndicator.classList.add("hidden")

            console.log(json)


            if (json.status) {
                const words = []
                currentWords = json.data

                json.data.forEach(word => {
                    words.push(`
                        <div class="text-gray-700 rounded-xl bg-white p-4 flex flex-col items-center gap-2">
                            <div class="text-center font-semibold text-xl">${word.word}</div>
                            <div class="text-center text-sm">Meaning / Pronunciation</div>
                            <div class="text-center font-semibold text-lg">"${word.meaning ?? "Unavailable ⚠️"} / ${word.pronunciation}"</div>
                            <div class="flex justify-between w-full px-8 mt-6">
                                <button class="information-button rounded bg-slate-100 p-2">ℹ️</button>
                                <button class="pronounce-button rounded bg-slate-100 p-2">🔊</button>
                            </div>
                        </div>
                    `)
                })

                if (words.length === 0) {
                    noWordsFound.classList.remove("hidden")
                    noWordsFound.classList.add("flex")
                } else {
                    wordsFound.innerHTML = words.join("\n")
                    wordsFound.classList.add("grid")
                    wordsFound.classList.remove("hidden")
                }
                
                initializeInformationButtons()
                initializePronounceButtons()
            } else {
                console.error("Could not load words!")
            }
        })
    })
}

const initialize = () => {
    const header = document.querySelector('header');
    const heroSection = document.querySelector('section:first-of-type');
    const vocabSection = document.querySelector('#learn');
    const faqSection = document.querySelector('#faq');
    const footer = document.querySelector('footer');
    const loginForm = heroSection.querySelector('form');
    const logoutButton = document.getElementById('logout');

    const nameInput = loginForm.querySelector('input[type="text"]');
    const passwordInput = loginForm.querySelector('input[type="password"]');
    const loginButton = loginForm.querySelector('button');

    header.style.display = 'none';
    vocabSection.style.display = 'none';
    faqSection.style.display = 'none';

    loginForm.addEventListener('submit', e => {
        e.preventDefault()
        const name = nameInput.value.trim();
        const password = passwordInput.value;

        if (!name) {
            Swal.fire({
                title: 'Error!',
                text: 'Please enter your name',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (password !== '123456') {
            Swal.fire({
                title: 'Error!',
                text: 'Invalid password',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        Swal.fire({
            title: 'Success!',
            text: `Welcome, ${name}!`,
            icon: 'success',
            confirmButtonText: 'Continue'
        }).then(() => {
            heroSection.style.display = 'flex';
            header.style.display = 'flex';
            vocabSection.style.display = 'block';
            faqSection.style.display = 'block';
        });
    });

    logoutButton.addEventListener('click', function() {
        header.style.display = 'none';
        heroSection.style.display = 'flex';
        vocabSection.style.display = 'none';
        faqSection.style.display = 'none';
        
        nameInput.value = '';
        passwordInput.value = '';
    });
}


const main = async () => {
    initialize()
    initializeFaq()
    await createLessonButtons()
    initializeLessons()
}

main()
