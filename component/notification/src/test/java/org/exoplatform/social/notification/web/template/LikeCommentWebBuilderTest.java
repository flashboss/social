package org.exoplatform.social.notification.web.template;

import org.exoplatform.commons.api.notification.NotificationContext;
import org.exoplatform.commons.api.notification.channel.AbstractChannel;
import org.exoplatform.commons.api.notification.channel.ChannelManager;
import org.exoplatform.commons.api.notification.channel.template.AbstractTemplateBuilder;
import org.exoplatform.commons.api.notification.model.ChannelKey;
import org.exoplatform.commons.api.notification.model.MessageInfo;
import org.exoplatform.commons.api.notification.model.NotificationInfo;
import org.exoplatform.commons.api.notification.model.PluginKey;
import org.exoplatform.commons.api.notification.plugin.BaseNotificationPlugin;
import org.exoplatform.commons.notification.channel.WebChannel;
import org.exoplatform.commons.notification.impl.NotificationContextImpl;
import org.exoplatform.social.core.activity.model.ExoSocialActivity;
import org.exoplatform.social.core.activity.model.ExoSocialActivityImpl;
import org.exoplatform.social.core.identity.model.Identity;
import org.exoplatform.social.notification.AbstractPluginTest;
import org.exoplatform.social.notification.plugin.LikeCommentPlugin;
import org.exoplatform.social.notification.plugin.LikePlugin;

import java.util.List;

/**
 * @author <a href="mailto:obouras@exoplatform.com">Omar Bouras</a>
 * @version ${Revision} *
 */
public class LikeCommentWebBuilderTest extends AbstractPluginTest {
    private ChannelManager manager;
    private final static String COMMENT_TITLE = "my comment's title add today.";

    @Override
    protected void setUp() throws Exception {
        super.setUp();
        manager = getService(ChannelManager.class);
    }

    @Override
    public void tearDown() throws Exception {
        super.tearDown();
    }


    @Override
    public AbstractTemplateBuilder getTemplateBuilder() {
        AbstractChannel channel = manager.getChannel(ChannelKey.key(WebChannel.ID));
        assertTrue(channel != null);
        assertTrue(channel.hasTemplateBuilder(PluginKey.key(LikeCommentPlugin.ID)));
        return channel.getTemplateBuilder(PluginKey.key(LikeCommentPlugin.ID));
    }

    @Override
    /**
     * Makes the comment for Test Case
     * @param activity
     * @param commenter
     * @param commentTitle
     * @return
     */
    protected ExoSocialActivity makeComment(ExoSocialActivity activity, Identity commenter, String commentTitle) {
        ExoSocialActivity comment = new ExoSocialActivityImpl();
        comment.setTitle(commentTitle);
        comment.setUserId(commenter.getId());
        activityManager.saveComment(activity, comment);
        comment = activityManager.getComments(activity).get(0);
        return comment;
    }

    @Override
    public BaseNotificationPlugin getPlugin() {
        return pluginService.getPlugin(PluginKey.key(LikeCommentPlugin.ID));
    }

    public void testSimpleCase() throws Exception {
        //STEP 1 post activity
        ExoSocialActivity activity = makeActivity(rootIdentity, "root post an activity");

        //STEP 2 add comment
        ExoSocialActivity comment = makeComment(activity, rootIdentity, COMMENT_TITLE);

        //STEP 3 like comment
        activityManager.saveLike(comment, demoIdentity);

        List<NotificationInfo> list = assertMadeWebNotifications(1);
        NotificationInfo likeNotification = list.get(0);

        //STEP 3 assert Message info
        NotificationContext ctx = NotificationContextImpl.cloneInstance();
        ctx.setNotificationInfo(likeNotification.setTo("root"));
        MessageInfo info = buildMessageInfo(ctx);

        assertBody(info, "likes your comment");
    }
}
