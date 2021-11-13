import { ApiRequestService } from "./request-service";
import { v4 as uuidv4 } from "uuid";
export interface SurveyResponse {
  success: boolean;
  data: Survey[];
}

export interface Survey {
  prompt: string;
  answers: [string?];
  id: string;
}

export class App {
  constructor() {}
  private rs = new ApiRequestService();
  private survey: Survey[] | undefined = [];
  private appNode = document.getElementById("app") as HTMLElement;

  _checkNewQuestionStatus(
    survey: Survey[] | undefined,
    addQuestionNode: HTMLButtonElement
  ) {
    if (survey?.length == 10) {
      addQuestionNode.disabled = true;
    } else {
      addQuestionNode.disabled = false;
    }
  }

  _addNewQuestionClick = (questionContent: DocumentFragment): void => {
    const addQuestionNode = document.querySelector(
      ".question__body--add"
    ) as HTMLButtonElement;

    addQuestionNode?.addEventListener("click", () => {
      this.appNode.appendChild(questionContent.cloneNode(true));
      this.survey?.push({ prompt: "Type", answers: [], id: uuidv4() });
      this._checkNewQuestionStatus(this.survey, addQuestionNode);
      console.log(this.survey);
    });
  };

  _addNewQuestion = (theNode: HTMLElement) => {
    return {
      theNode,
    };
  };

  _addZeroes = (input: string) => {
    input.length == 1 ? true : (input = `0${input}`);
    return input;
  };

  _buildQuestions = (
    questionContent: DocumentFragment,
    answerContent: DocumentFragment,
    survey: Survey[]
  ) => {
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
        currentAnswerIndexNode.innerHTML = `${this._addZeroes(q_Index + 1)}`;
        //@ts-expect-error depends on template classes
        currentAnswerTextNode.innerHTML = `${answer}`;
      });
    });
  };

  buildDOM = (
    questionContent: DocumentFragment,
    answerContent: DocumentFragment,
    survey: Survey[]
  ) => {
    this._buildQuestions(questionContent, answerContent, survey);
  };

  init = async () => {
    const response = await this.rs.getSurvey();
    if (response !== undefined) {
      this.survey = await response.data;
      console.log(this.survey);

      const questionNode = document.getElementById(
        "question"
      ) as HTMLTemplateElement;
      const questionContent = questionNode.content;
      const answerNode = document.getElementById(
        "answer"
      ) as HTMLTemplateElement;
      const answerContent = answerNode.content;

      this.buildDOM(questionContent, answerContent, this.survey);
      this._addNewQuestionClick(questionContent);
    }
  };
}
