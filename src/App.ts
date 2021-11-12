import { ApiRequestService } from "./request-service";

export interface SurveyResponse {
  success: boolean;
  data: Survey[];
}

export interface Survey {
  prompt: string;
  answers: [string?];
  id: number;
}

export class App {
  constructor() {}
  private rs = new ApiRequestService();
  private survey: Survey[] | undefined = [];
  private appNode = document.getElementById("app") as HTMLElement;

  _buildQuestions(
    questionContent: DocumentFragment,
    answerContent: DocumentFragment,
    survey: Survey[]
  ) {
    survey.forEach((question, index) => {
      this.appNode.appendChild(questionContent.cloneNode(true));
      const currentNode = this.appNode.querySelectorAll(".question")[index];
      const currentQuestionIndexNode = currentNode.querySelector(
        ".question__header--index"
      );
      const currentQuestionTitleNode = currentNode.querySelector(
        ".question__body--text"
      );
      //@ts-expect-error depends on template classes
      currentQuestionIndexNode.innerHTML = `${index + 1}`;
      //@ts-expect-error depends on template classes
      currentQuestionTitleNode.innerHTML = `${question.prompt}`;

      question.answers.forEach((answer, q_Index) => {
        const latestQuestion = currentNode.querySelector(".answer");
        latestQuestion?.appendChild(answerContent.cloneNode(true));
        const currentAnswerIndexNode = latestQuestion?.querySelectorAll(
          ".answer__header--index"
        )[q_Index];
        const currentAnswerTextNode = latestQuestion?.querySelectorAll(
          ".answer__body--text"
        )[q_Index];

        //@ts-expect-error depends on template classes
        currentAnswerIndexNode.innerHTML = `${q_Index + 1}`;
        //@ts-expect-error depends on template classes
        currentAnswerTextNode.innerHTML = `${answer}`;
      });
    });
  }

  buildDOM = (survey: Survey[]) => {
    const questionNode = document.getElementById(
      "question"
    ) as HTMLTemplateElement;
    const questionContent = questionNode.content;
    const answerNode = document.getElementById("answer") as HTMLTemplateElement;
    const answerContent = answerNode.content;
    this._buildQuestions(questionContent, answerContent, survey);
  };

  init = async () => {
    const response = await this.rs.getSurvey();
    if (response !== undefined) {
      this.survey = await response.data;
      this.buildDOM(this.survey);
    }
  };
}
