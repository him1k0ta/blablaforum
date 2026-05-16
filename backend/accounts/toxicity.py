import re
from typing import Tuple, List

class ToxicityAnalyzer:
    """
    Анализатор токсичности текста.
    Начинаем с простого списка стоп-слов.
    """
    
    # Базовый список стоп-слов (можно расширить)
    TOXIC_WORDS = [
        'мудак', 'идиот', 'дебил', 'тупой', 'дурак', 'урод', 'сволочь',
        'хуй', 'пизда', 'блядь', 'сучка', 'шлюха', 'пидор',
        'ебать', 'ёбать', 'заебал', 'выебал', 'нахуй', 'охуеть',
        'гандон', 'петух', 'мразь', 'скотина', 'шалава', 'мандавошка',
        'убейся', 'задавись', 'умри', 'сдохни', 'отъебись',
        'мамкин', 'мамка', 'чмо', 'чмонина', 'чморик',
        'херня', 'херовина', 'дерьмо', 'говно', 'срань',
        'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick',
        'nigger', 'nigga', 'faggot', 'fag', 'retard', 'autist'
    ]
    
    # Регулярные выражения для более сложных паттернов
    TOXIC_PATTERNS = [
        r'\b(с|соси|соси\s*и)\s+.*\b',  # оскорбления с "соси"
        r'\b(е|ё|ёб)\s+[а-я]{3,}\b',  # мат на "ёб"
        r'\b(п|пи)\s*[д-т]{2,}\b',  # мат на "пид"
        r'\bхуй\s+[а-я]{1,}\b',  # производные от "хуй"
        r'\bбля\s*[т-д]{1,}\b',  # производные от "бля"
        r'\b(у|оу)\s+[б-п]{1,}\s+[а-я]{1,}\b',  # оскорбления с "уб"
    ]
    
    @classmethod
    def analyze_text(cls, text: str) -> Tuple[bool, float, List[str]]:
        """
        Анализирует текст на токсичность.
        
        Returns:
            (is_toxic, toxicity_score, detected_words)
        """
        if not text:
            return False, 0.0, []
        
        text_lower = text.lower()
        detected_words = []
        toxicity_score = 0.0
        
        # Проверяем стоп-слова
        for word in cls.TOXIC_WORDS:
            pattern = r'\b' + re.escape(word) + r'\b'
            if re.search(pattern, text_lower, re.IGNORECASE):
                detected_words.append(word)
                toxicity_score += 0.5
        
        # Проверяем паттерны
        for pattern in cls.TOXIC_PATTERNS:
            if re.search(pattern, text_lower, re.IGNORECASE):
                detected_words.append('toxic_pattern')
                toxicity_score += 0.7
        
        # Дополнительные проверки
        if cls._has_excessive_caps(text):
            toxicity_score += 0.3
            detected_words.append('excessive_caps')
        
        if cls._has_repeated_chars(text):
            toxicity_score += 0.2
            detected_words.append('repeated_chars')
        
        # Определяем порог токсичности
        TOXICITY_THRESHOLD = 0.5
        is_toxic = toxicity_score >= TOXICITY_THRESHOLD
        
        # Ограничиваем максимальный счет
        toxicity_score = min(toxicity_score, 1.0)
        
        return is_toxic, toxicity_score, detected_words
    
    @classmethod
    def _has_excessive_caps(cls, text: str, threshold: float = 0.7) -> bool:
        """Проверяет избыточное использование заглавных букв."""
        if len(text) < 5:
            return False
        
        caps_count = sum(1 for c in text if c.isupper())
        caps_ratio = caps_count / len(text)
        return caps_ratio >= threshold
    
    @classmethod
    def _has_repeated_chars(cls, text: str, threshold: int = 3) -> bool:
        """Проверяет повторяющиеся символы."""
        for i in range(len(text) - threshold + 1):
            if text[i] == text[i+1] == text[i+2] == text[i+3]:
                return True
        return False
    
    @classmethod
    def get_toxicity_level(cls, score: float) -> str:
        """Возвращает уровень токсичности."""
        if score >= 0.8:
            return "Очень высокий"
        elif score >= 0.6:
            return "Высокий"
        elif score >= 0.4:
            return "Средний"
        elif score >= 0.2:
            return "Низкий"
        else:
            return "Отсутствует"
