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
    addQuestionNode: HTMLButtonElement,
    survey: Survey[] | undefined
  ) {
    if (survey?.length == 10) {
      addQuestionNode.disabled = true;
    } else {
      addQuestionNode.disabled = false;
    }
  }

  _addNewQuestionClick = (
    addQuestionNode: HTMLButtonElement,
    questionContent: DocumentFragment
  ) => {
    const addStuff = async () => {
      this.survey?.push({
        prompt: "Enter your question",
        answers: [],
        id: uuidv4(),
      });
      const requestResult: boolean = await this.rs.saveSurvey(this.survey);
      console.log(requestResult);

      if (!requestResult) {
        alert("Could not save question");
        this.survey?.pop();
      } else {
        this.appNode.appendChild(questionContent.cloneNode(true));
        const allQuestions = this.appNode.querySelectorAll(".question");
        //@ts-expect-error depends on template classes
        allQuestions[allQuestions.length - 1].querySelector(
          ".question__header--index"
        ).innerHTML = this.survey?.length.toString();
        this._checkNewQuestionStatus(addQuestionNode, this.survey);
      }
      console.log(this.survey);
    };

    addQuestionNode?.addEventListener("click", addStuff);
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

      const addQuestionNode = document.querySelector(
        ".question__body--add"
      ) as HTMLButtonElement;

      this.buildDOM(questionContent, answerContent, this.survey);
      this._checkNewQuestionStatus(addQuestionNode, this.survey);
      this._addNewQuestionClick(addQuestionNode, questionContent);
    }
  };
}
