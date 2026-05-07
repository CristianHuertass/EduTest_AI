def calculate_grade(quiz_data: list[dict], user_answers: dict) -> dict:
    """
    Calcula la nota de un cuestionario.
    :param quiz_data: Lista de preguntas (cada una con 'respuesta_correcta', 'pregunta', 'justificacion')
    :param user_answers: Diccionario con respuestas del usuario { "0": "A", "1": "B" ... }
    """
    if not quiz_data:
        raise ValueError("El cuestionario no tiene preguntas (quiz_data vacío)")
        
    correct = 0
    total = len(quiz_data)
    detail = []
    
    for i, question in enumerate(quiz_data):
        # Permitir llaves numéricas o strings en el diccionario de respuestas
        ans = user_answers.get(str(i))
        if ans is None:
            ans = user_answers.get(i)
            
        is_correct = (ans == question.get("respuesta_correcta"))
        if is_correct:
            correct += 1
            
        detail.append({
            "pregunta": question.get("pregunta"),
            "seleccionada": ans,
            "correcta": question.get("respuesta_correcta"),
            "acertada": is_correct,
            "justificacion": question.get("justificacion")
        })
        
    percentage = round((correct / total) * 100)
    
    return {
        "correct": correct,
        "total": total,
        "percentage": percentage,
        "detail": detail
    }
