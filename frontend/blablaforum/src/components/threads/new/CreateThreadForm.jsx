import React, { useState } from 'react';
import { useThreads } from '../../../ThreadsContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../../../style/threads/new/CreateThreadForm.module.css';

const CreateThreadForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createThread, fetchThreads } = useThreads();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formattedTags = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];
      
      await createThread({
        title: formData.title,
        content: formData.content,
        tags: formattedTags
      });
      
      toast.success('Тред успешно создан!');
      await fetchThreads(); // Обновляем список тредов
      
      // Перенаправление на главную страницу с тредами
      navigate('/threads', { replace: true }); 
      // { replace: true } заменяет текущую запись в истории, 
      // чтобы пользователь не мог вернуться назад к форме
      
    } catch (err) {
      toast.error(err.message || 'Ошибка при создании треда');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.threadFormContainer}>
      <h2 className={styles.formTitle}>Создание нового треда</h2>
      <form className={styles.threadForm} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Заголовок *</label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Введите заголовок треда"
            value={formData.title}
            onChange={handleChange}
            required
            minLength="3"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="content">Содержание *</label>
          <textarea
            id="content"
            name="content"
            placeholder="Опишите вашу тему..."
            rows={6}
            value={formData.content}
            onChange={handleChange}
            required
            minLength="10"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="tags">Теги (через запятую)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            placeholder="например: frontend, react, ui"
            value={formData.tags}
            onChange={handleChange}
          />
          {formData.tags && (
            <div className={styles.tagsPreview}>
              Будут добавлены теги: {formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag).join(', ')}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className={styles.submitBtn}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Создание...' : 'Создать тред'}
        </button>
      </form>
    </div>
  );
};

export default CreateThreadForm;