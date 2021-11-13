import { Survey, SurveyResponse } from "./App";

export class ApiRequestService {
  public async getSurvey(): Promise<SurveyResponse | undefined> {
    const configUrl: string = `http://localhost:5000/api/questions`;
    const survey: Response = await fetch(configUrl);
    if (survey) {
      const data: Promise<SurveyResponse> = survey.json();
      return data;
    } else {
      return undefined;
    }
  }

  public async saveSurvey(survey: Survey[] | undefined) {
    const configUrl: string = `http://localhost:5000/api/questionnaire`;
    let response: boolean = true;
    fetch(configUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(survey),
    })
      .then((data) => {
        console.log(data);

        response = data.ok;
      })
      .catch((error) => {
        console.error("Error:", error);
        throw new Error();
      });
    return response;
  }
}
