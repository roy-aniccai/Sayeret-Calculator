import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { Button } from './Button';

export const NotificationDemo: React.FC = () => {
  const { 
    showToast, 
    showSuccess, 
    showError, 
    showWarning, 
    showInfo,
    showSuccessAlert,
    showErrorAlert,
    showWarningAlert,
    showInfoAlert,
    showConfirm
  } = useNotification();

  return (
    <div className="p-6 space-y-4 bg-gray-50 rounded-xl">
      <h3 className="text-xl font-bold text-gray-900 mb-4">מערכת התראות מתקדמת</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Toast Notifications */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-700">התראות קלות (Toast)</h4>
          <Button
            variant="secondary"
            onClick={() => showSuccess('הפעולה בוצעה בהצלחה!', 'הצלחה')}
            className="w-full text-sm"
          >
            הצלחה
          </Button>
          <Button
            variant="secondary"
            onClick={() => showError('אירעה שגיאה במערכת', 'שגיאה')}
            className="w-full text-sm"
          >
            שגיאה
          </Button>
          <Button
            variant="secondary"
            onClick={() => showWarning('אזהרה חשובה', 'אזהרה')}
            className="w-full text-sm"
          >
            אזהרה
          </Button>
          <Button
            variant="secondary"
            onClick={() => showInfo('מידע שימושי', 'מידע')}
            className="w-full text-sm"
          >
            מידע
          </Button>
        </div>

        {/* Alert Dialogs */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-700">חלונות דיאלוג (Alert)</h4>
          <Button
            variant="secondary"
            onClick={() => showSuccessAlert('פעולה הושלמה', 'הנתונים נשמרו בהצלחה במערכת')}
            className="w-full text-sm"
          >
            הצלחה
          </Button>
          <Button
            variant="secondary"
            onClick={() => showErrorAlert('שגיאה בשליחת הנתונים', 'אירעה שגיאה בשליחת הנתונים. אנא בדוק את החיבור לאינטרנט ונסה שנית.')}
            className="w-full text-sm"
          >
            שגיאה
          </Button>
          <Button
            variant="secondary"
            onClick={() => showWarningAlert('אזהרה', 'פעולה זו עלולה למחוק נתונים. האם אתה בטוח?')}
            className="w-full text-sm"
          >
            אזהרה
          </Button>
          <Button
            variant="secondary"
            onClick={() => showInfoAlert('מידע חשוב', 'המערכת תעבור לתחזוקה בשעה 23:00')}
            className="w-full text-sm"
          >
            מידע
          </Button>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <Button
          onClick={() => showConfirm(
            'אישור פעולה',
            'האם אתה בטוח שברצונך למחוק את הנתונים? פעולה זו לא ניתנת לביטול.',
            () => showSuccess('הנתונים נמחקו בהצלחה'),
            'מחק',
            'ביטול'
          )}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          דוגמה לאישור מחיקה
        </Button>
      </div>

      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <strong>שיפורים במערכת ההתראות:</strong>
        <ul className="mt-2 space-y-1">
          <li>• עיצוב מודרני ומקצועי</li>
          <li>• אנימציות חלקות</li>
          <li>• תמיכה בעברית מלאה</li>
          <li>• סגירה אוטומטית</li>
          <li>• איקונים ברורים לכל סוג התראה</li>
          <li>• התאמה לעיצוב האפליקציה</li>
        </ul>
      </div>
    </div>
  );
};