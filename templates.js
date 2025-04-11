const templates = {
    mainMenu: Handlebars.compile(`
        <div class="quiz-card card">
            <div class="card-header bg-primary text-white">
                <h2>Welcome to the Quiz!</h2>
            </div>
            <div class="card-body">
                <form id="start-form">
                    <div class="mb-3">
                        <label class="form-label">Your Name:</label>
                        <input type="text" class="form-control" id="student-name" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-100">Start Quiz</button>
                </form>
            </div>
        </div>
    `),
    
    quizQuestion: Handlebars.compile(`
        <div class="quiz-card card">
            <div class="card-header bg-primary text-white d-flex justify-content-between">
                <h5>Question {{number}}</h5>
                <div>
                    <span class="timer-display">{{time}}s</span>
                    <span class="badge bg-light text-dark ms-2">Score: {{score}}%</span>
                </div>
            </div>
            <div class="card-body">
                <h4 class="mb-4">{{question}}</h4>
                <div class="options">
                    {{#each options}}
                    <button class="btn btn-option btn-outline-primary w-100" data-option="{{@index}}">
                        {{this}}
                    </button>
                    {{/each}}
                </div>
            </div>
        </div>
    `)
};
