import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { feedService, type FeedPost } from '../../src/services/feed.service';
import { Avatar } from '../../src/components/ui/Avatar';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/constants/theme';

export default function FeedScreen() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPosts = useCallback(async () => {
    const data = await feedService.getFeedPosts();
    setPosts(data);
    setIsLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const onRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}dk`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}sa`;
    const days = Math.floor(hours / 24);
    return `${days}g`;
  };

  const renderPost = ({ item }: { item: FeedPost }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Avatar name={item.userName} size={40} />
        <View style={styles.postHeaderText}>
          <Text style={styles.postUserName}>{item.userName || 'Kullanıcı'}</Text>
          <Text style={styles.postTime}>{timeAgo(item.createdAt)}</Text>
        </View>
      </View>
      <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
      {item.caption && (
        <View style={styles.postCaption}>
          <Text style={styles.captionUser}>{item.userName}</Text>
          <Text style={styles.captionText}> {item.caption}</Text>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {posts.length === 0 ? (
        <EmptyState
          icon="images-outline"
          title={t('feed.empty_title')}
          description={t('feed.empty_description')}
        />
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingBottom: spacing.xxxl },
  postCard: {
    backgroundColor: colors.card,
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  postHeaderText: {
    marginLeft: spacing.md,
  },
  postUserName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  postTime: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: 1,
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
  },
  postCaption: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  captionUser: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  captionText: {
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 1,
  },
});
